import {
  OaDocumentRevocationTypeMapper,
  RENDERER_ERROR_TYPE,
  RENDERER_MESSAGE_TYPE,
  RendererMessage,
  REVOCATION_TYPE,
} from '@filesg/common';
import { Button, Color, FileSpinner, FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { FrameActions, HostActionsHandler, print } from '@govtechsg/decentralized-renderer-react-components';
import {
  isValid,
  OpenAttestationDidSignedDocumentStatusVerificationFragment,
  openAttestationVerifiers,
  utils,
  verificationBuilder,
  VerificationFragment,
} from '@govtechsg/oa-verify';
import { getData, SignedWrappedDocument, v2, validateSchema } from '@govtechsg/open-attestation';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { config } from '../../../config/app-config';
import { TEST_IDS } from '../../../consts';
import { FILE_PREVIEW_ERROR } from '../../../consts/error';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { useTimer } from '../../../hooks/common/useTimer';
import { useGenerateQrCode } from '../../../hooks/queries/useGenerateQrCode';
import { useOaVerification } from '../../../hooks/queries/useOaVerification';
import { selectContentRetrievalToken } from '../../../store/slices/non-singpass-session';
import {
  resetOpenAttestation,
  selectOpenAttestation,
  setIsTemplateRenderingComplete,
  setVerificationResult,
} from '../../../store/slices/open-attestation';
import { DocumentVerificationResult } from './components/document-verification-result';
import {
  FrameConnectorContainer,
  NoPreviewContainer,
  StyledErrorInfo,
  StyledFrameConnector,
  StyledInformationBanner,
  StyledWrapper,
} from './style';

type Props = PropsWithQr | PropsWithoutQr;

interface TimerConfig {
  durationInMs: number;
  onTimerEnd?: () => void;
}

type PropsWithQr = {
  blob: Blob;
  showQr: true;
  fileAssetUuid: string;
  isVerificationResultsExpandable?: boolean;
  timerConfig?: TimerConfig;
  showFullDetails?: boolean;
  showPassIfStatusInvalid?: boolean;
};

type PropsWithoutQr = {
  blob: Blob;
  showQr: false;
  isVerificationResultsExpandable?: boolean;
  timerConfig?: TimerConfig;
  showFullDetails?: boolean;
  showPassIfStatusInvalid?: boolean;
};

const { image: filePreviewErrorImage, title: filePreviewErrorTitle, descriptions: filePreviewErrorDescriptions } = FILE_PREVIEW_ERROR;

const getMappedRevocationType = (didSignedStatusFragment: OpenAttestationDidSignedDocumentStatusVerificationFragment) => {
  if (didSignedStatusFragment.reason && didSignedStatusFragment.reason.codeString !== 'UNEXPECTED_ERROR') {
    const { code } = didSignedStatusFragment.reason;
    const revocationType = Object.entries(OaDocumentRevocationTypeMapper).find(([_, reasonCode]) => reasonCode === code);
    return revocationType ? (revocationType[0] as REVOCATION_TYPE) : null;
  }
  return null;
};

export const OADocumentLoader = forwardRef(
  (
    {
      blob,
      showQr,
      isVerificationResultsExpandable = true,
      timerConfig,
      showFullDetails = false,
      showPassIfStatusInvalid = false,
      ...rest
    }: Props,
    ref,
  ) => {
    const [signedWrappedDocument, setSignedWrappedDocument] = useState<SignedWrappedDocument<v2.OpenAttestationDocument>>();
    const [oaDocument, setOaDocument] = useState<v2.OpenAttestationDocument>();
    const [isFallbackVerifyingOa, setIsFallbackVerifyingOa] = useState(false);
    const [rendererSource, setRendererSource] = useState('');

    const [toFrame, setToFrame] = useState<HostActionsHandler>();
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [isError, setIsError] = useState(false);
    const [isRendererConnected, setIsRendererConnected] = useState(false);
    const [oaSchemaError, setOaSchemaError] = useState('');
    const [height, setHeight] = useState(0);
    const [isProfileImageLoaded, setIsProfileImageLoaded] = useState(false);

    const { verificationResult } = useAppSelector(selectOpenAttestation);
    const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);
    const dispatch = useAppDispatch();

    const rendererIframe = document.getElementById('iframe');

    const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

    const { timerDone, startTimer } = useTimer(timerConfig?.durationInMs || 0);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    function retryHandler() {
      if (qrCodeDetailsError) {
        refetchQrCodeDetails();
      }

      setIsError(false);
    }

    const handleVerificationResult = (fragments: VerificationFragment[]) => {
      const didSignedStatusFragment = utils.getOpenAttestationDidSignedDocumentStatusFragment(fragments);
      const revocationType = didSignedStatusFragment ? getMappedRevocationType(didSignedStatusFragment) : null;

      dispatch(
        setVerificationResult({
          documentIntegrity: isValid(fragments, ['DOCUMENT_INTEGRITY']),
          documentStatus: isValid(fragments, ['DOCUMENT_STATUS']),
          issuerIdentity: isValid(fragments, ['ISSUER_IDENTITY']),
          overall: isValid(fragments),
          revocationType,
        }),
      );

      // Once gotten the verification results, get the OA datca
      if (signedWrappedDocument) {
        const oaDoc = getData(signedWrappedDocument);
        setOaDocument(oaDoc);
      }
    };

    // ===========================================================================
    // Query
    // ===========================================================================
    const {
      data: qrCodeDetails,
      refetch: refetchQrCodeDetails,
      isLoading: isLoadingQrCodeDetails,
      error: qrCodeDetailsError,
    } = useGenerateQrCode(rest['fileAssetUuid'], showQr, contentRetrievalToken, { onError: () => setIsError(true) });

    const { isLoading: isVerifyingOa, mutate: verifyOa } = useOaVerification({
      onSuccess: async (data) => {
        handleVerificationResult(data.fragments);
      },
      onError: async () => {
        setIsFallbackVerifyingOa(true);
        const provider = utils.generateProvider();
        const verify = verificationBuilder(openAttestationVerifiers, { provider });
        const fragments = await verify(signedWrappedDocument!);

        handleVerificationResult(fragments);
        setIsFallbackVerifyingOa(false);
      },
    });

    // ===========================================================================
    // Hooks
    // ===========================================================================
    /** Expose function to parent component */
    useImperativeHandle(ref, () => {
      return {
        print: () => {
          toFrame && toFrame(print());
        },
      };
    });

    // ===========================================================================
    // useEffects
    // ===========================================================================
    useEffect(() => {
      return () => {
        dispatch(resetOpenAttestation());
      };
    }, [dispatch]);

    // Make iframe untabbable
    useEffect(() => {
      if (rendererIframe) {
        rendererIframe.setAttribute('tabindex', '-1');
      }
    }, [rendererIframe]);

    // Select template
    useEffect(() => {
      if (toFrame && selectedTemplate) {
        toFrame({
          type: 'SELECT_TEMPLATE',
          payload: selectedTemplate,
        });
      }
    }, [selectedTemplate, toFrame]);

    // Handle OA Scheme Validation
    useEffect(() => {
      async function handleValidateOASchema(blob: Blob) {
        try {
          const content = JSON.parse(await blob.text());
          const validated = validateSchema(content);

          if (!validated) {
            throw new Error();
          }

          setSignedWrappedDocument(content);
        } catch (err) {
          // TODO: Handle schema error in the future, if upload feature is built
          setOaSchemaError('File cannot be read. The file is not a valid Open Attestation file.');
        }
      }

      handleValidateOASchema(blob);
    }, [blob]);

    // Once OA Schema validated successfully, get verification result of the OA doc
    useEffect(() => {
      if (signedWrappedDocument) {
        verifyOa(signedWrappedDocument);
      }
    }, [verifyOa, signedWrappedDocument]);

    /** If there is document (after verification), get the renderer source url */
    useEffect(() => {
      if (oaDocument) {
        const { url } = oaDocument.$template as v2.TemplateObject;
        if (url) {
          setRendererSource(url);
        }
      }
    }, [oaDocument]);

    // Pass document to renderer
    useEffect(() => {
      if (toFrame && oaDocument) {
        toFrame({
          type: 'RENDER_DOCUMENT',
          payload: {
            document: {
              ...oaDocument,
              verificationResult,
              qrCodeDetails,
              showQr,
              showFullDetails,
            } as v2.OpenAttestationDocument,
            rawDocument: signedWrappedDocument,
          },
        });
      }
    }, [toFrame, oaDocument, verificationResult, showQr, qrCodeDetails, signedWrappedDocument, showFullDetails]);

    // Add listener for renderer error message
    useEffect(() => {
      const messageHandler = (event: MessageEvent<RendererMessage>) => {
        if (event.origin !== config.rendererUrl) {
          return;
        }

        const message = event.data;

        switch (message.type) {
          case RENDERER_MESSAGE_TYPE.ERROR:
            if (message.errorType === RENDERER_ERROR_TYPE.IMAGE_NOT_LOADED) {
              setIsRendererConnected(false);
              return setIsError(true);
            }
            break;

          case RENDERER_MESSAGE_TYPE.PROFILE_IMAGE_LOADED:
            setIsProfileImageLoaded(true);
            dispatch(setIsTemplateRenderingComplete(true));
            break;

          default:
            return;
        }
      };

      window.addEventListener('message', messageHandler);

      return () => window.removeEventListener('message', messageHandler);
    }, [dispatch]);

    useEffect(() => {
      if (timerConfig?.durationInMs) {
        startTimer();
      }
    }, [startTimer, timerConfig]);

    useEffect(() => {
      if (timerDone && timerConfig?.onTimerEnd) {
        timerConfig.onTimerEnd();
      }
    }, [timerDone, timerConfig]);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const onConnected = useCallback((toFrame: HostActionsHandler) => {
      // wrap into a function otherwise toFrame function will be executed
      setToFrame(() => toFrame);
      setIsRendererConnected(true);
    }, []);

    const fromFrame = (action: FrameActions): void => {
      if (action.type === 'UPDATE_TEMPLATES') {
        setSelectedTemplate(action.payload[0].id);
      }

      if (action.type === 'UPDATE_HEIGHT') {
        setHeight(action.payload);
      }

      if (action.type === 'TIMEOUT') {
        setIsError(true);
      }
    };

    // ===========================================================================
    // Render
    // ===========================================================================

    const getDocument = () => {
      switch (true) {
        case isError:
          return (
            <StyledErrorInfo
              image={filePreviewErrorImage}
              title={filePreviewErrorTitle}
              descriptions={filePreviewErrorDescriptions}
              isCentered
            >
              <Button label="Reload Page" onClick={retryHandler} />
            </StyledErrorInfo>
          );

        case isVerifyingOa && isVerificationResultsExpandable:
          return (
            <NoPreviewContainer>
              <FileSpinner>Loading file...</FileSpinner>
            </NoPreviewContainer>
          );

        case !!oaDocument && !!rendererSource:
          return (
            <FrameConnectorContainer>
              {(!showPassIfStatusInvalid && !verificationResult?.documentStatus) ||
              !verificationResult?.documentIntegrity ||
              !verificationResult?.issuerIdentity ||
              oaSchemaError ? (
                <NoPreviewContainer>
                  <Typography variant={isSmallerThanSmallTablet ? 'PARAGRAPH' : 'PARAGRAPH_LARGE'} color={Color.GREY80}>
                    No preview available
                  </Typography>
                </NoPreviewContainer>
              ) : (
                <>
                  {(!isRendererConnected || isLoadingQrCodeDetails || !isProfileImageLoaded) && !height && (
                    <NoPreviewContainer>
                      <FileSpinner>Loading file...</FileSpinner>
                    </NoPreviewContainer>
                  )}
                  {!isLoadingQrCodeDetails && (
                    <StyledFrameConnector source={rendererSource} dispatch={fromFrame} onConnected={onConnected} height={height} />
                  )}
                </>
              )}
            </FrameConnectorContainer>
          );
      }
    };

    return (
      <StyledWrapper>
        <DocumentVerificationResult
          isExpandable={isVerificationResultsExpandable}
          issuers={oaDocument?.issuers}
          isVerifying={!verificationResult || isVerifyingOa || isFallbackVerifyingOa}
          verificationResult={verificationResult}
        />
        {!showFullDetails && isRendererConnected && (
          <StyledInformationBanner data-testid={TEST_IDS.TEXT_INFO}>
            <Typography variant="SMALL">
              Please note that some information on this document has been masked due to privacy and security considerations.
            </Typography>
          </StyledInformationBanner>
        )}
        {getDocument()}
      </StyledWrapper>
    );
  },
);
