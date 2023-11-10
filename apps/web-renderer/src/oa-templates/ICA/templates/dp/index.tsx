import {
  AgencyClientPhotoResponse,
  RENDERER_ERROR_TYPE,
  RENDERER_MESSAGE_TYPE,
  RendererMessage,
  RendererProfileImageLoadedMessage,
} from '@filesg/common';
import { TemplateProps } from '@govtechsg/decentralized-renderer-react-components';
import html2canvas from 'html2canvas';
import { useEffect, useRef, useState } from 'react';

import { ErrorAction } from '../../../../components/error-action';
import { config } from '../../../../config/app-config';
import { AGENCY_NAME, FILE_PREVIEW_ERROR, PASS_NAME, PLACEHOLDER_IMAGE_BASE64 } from '../../../../const';
import { useRetrieveIcaPhoto } from '../../../../hooks/queries/useRetrieveIcaPhoto';
import { LtpPass } from '../../../../typings';
import icaLogo from '../../assets/logos/ica-logo.png';
import { IdentityCard } from '../../components/identity-card';
import { IssuedBy } from '../../components/issued-by';
import { Verification } from '../../components/verification';
import { BarcodeCardContainer, PassContainer, StyledBarcode, StyledImage, TemplateContainer } from './style';

type Props = TemplateProps<LtpPass> & { className?: string };

const { image: filePreviewErrorImage, title: filePreviewErrorTitle, descriptions: filePreviewErrorDescriptions } = FILE_PREVIEW_ERROR;

export const DpTemplate = ({ document, wrappedDocument, className = '' }: Props) => {
  const [url, setUrl] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>();
  const templateRef = useRef<HTMLDivElement>(null);
  const passRef = useRef<HTMLDivElement>(null);

  const { agencyData, showQr = false, qrCodeDetails, verificationResult, showFullDetails = true} = document;
  const { fin } = agencyData;

  const hasVerificationResultAndIsOverallInvalid = verificationResult && !verificationResult.overall;

  const { mutate: retrieveIcaPhoto, error } = useRetrieveIcaPhoto({
    onSuccess: (data: AgencyClientPhotoResponse) => {
      setPhotoBase64(data.photo);
    },
  });

  // ===========================================================================
  // UseEffects
  // ===========================================================================
  /* NOTE: toPng is asynchronous, and potentially outputs the dataUrl with the updated(display:none / removed) node,
   * returning an empty dataUrl ('data:/')
   * Issue was *possibly* caused by additional triggers of the useEffect, resulting in subsequent toPng calling with the display: none / removed node
   *
   * Additional triggers was caused by calling resetOpenAttestation() slice action without dispatch in OA Document Loader (verify useEffect)
   * Not calling the dispatch did not reproduce the issue
   * Underlying reasons unknown
   */
  useEffect(() => {
    const passNode = passRef.current;

    if (passNode && photoBase64) {
      /**
       * Converted to image to retain aspect ratio
       *
       * Note: If background-image used is .svg format, will cause "SecurityError: Operation is insecure error on safari. Using png until fixed.
       *
       * https://github.com/niklasvh/html2canvas/pull/2911
       */
      html2canvas(passNode, { logging: true }).then((canvas) => {
        const dataUrl = canvas.toDataURL();
        setUrl(dataUrl);

        passNode.remove();
      });
    }
  }, [photoBase64, document.id]); // Document Id as dependancy to prevent additional triggers due to same document (same content, different ref) being passed in

  useEffect(() => {
    if (error) {
      const message: RendererMessage = {
        type: RENDERER_MESSAGE_TYPE.ERROR,
        errorType: RENDERER_ERROR_TYPE.IMAGE_NOT_LOADED,
        message: error.message,
      };

      window.top?.postMessage(message, config.portalUrl);
    }
  }, [error]);

  useEffect(() => {
    if (hasVerificationResultAndIsOverallInvalid) {
      return setPhotoBase64(PLACEHOLDER_IMAGE_BASE64);
    }

    if (wrappedDocument) {
      retrieveIcaPhoto(wrappedDocument);
    }
  }, [hasVerificationResultAndIsOverallInvalid, retrieveIcaPhoto, wrappedDocument]);

  useEffect(() => {
    if (photoBase64) {
      const message: RendererProfileImageLoadedMessage = {
        type: RENDERER_MESSAGE_TYPE.PROFILE_IMAGE_LOADED,
        message: 'Profile image loaded',
      };

      window.top?.postMessage(message, config.portalUrl);
    }
  }, [photoBase64]);

  // ===========================================================================
  // Render
  // ===========================================================================
  if (error) {
    return (
      <ErrorAction
        image={filePreviewErrorImage}
        title={filePreviewErrorTitle}
        descriptions={filePreviewErrorDescriptions}
        buttonLabel="Reload Page"
        onClick={() => wrappedDocument && retrieveIcaPhoto(wrappedDocument)}
      />
    );
  }

  return photoBase64 ? (
    <TemplateContainer $showQr={showQr} showFullDetails={showFullDetails} ref={templateRef}>
      <PassContainer>
        <BarcodeCardContainer ref={passRef}>
          {showQr && (
            <StyledBarcode
              value={fin}
              options={{
                displayValue: false,
                width: 2.57, // scale multiplier, 2.57x gives a 359px width
                height: 55,
                margin: 21,
                background: 'transparent',
              }}
            />
          )}

          <IdentityCard
            title={PASS_NAME.DP}
            document={document}
            className={className}
            profileImage={photoBase64}
            showFullDetails={showFullDetails}
            showWatermark={hasVerificationResultAndIsOverallInvalid}
          />

          <IssuedBy agencyName={AGENCY_NAME.ICA} agencyLogo={icaLogo} />
        </BarcodeCardContainer>
        {url && <StyledImage src={url} />}
      </PassContainer>
      {showQr && qrCodeDetails && <Verification qrCodeDetails={qrCodeDetails} size={148} />}
    </TemplateContainer>
  ) : null;
};
