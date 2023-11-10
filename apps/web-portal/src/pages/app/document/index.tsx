import { AUDIT_EVENT_NAME, FILE_TYPE } from '@filesg/common';
import { FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';
import { printPlugin } from '@react-pdf-viewer/print';
import saveAs from 'file-saver';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BOTTOM_SHEET_TAB } from '../../../components/data-display/bottom-sheet';
import { FileHistoryModal } from '../../../components/feedback/modal/file-history-modal';
import { MINIMUM_LOAD_DELAY_IN_MILLISECONDS } from '../../../consts';
import { useBlockerPrompt } from '../../../hooks/common/useBlockerPrompt';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAppSelector } from '../../../hooks/common/useSlice';
import { useTimer } from '../../../hooks/common/useTimer';
import { useDownloadFromS3 } from '../../../hooks/queries/useDownloadFromS3';
import { useFileAsset } from '../../../hooks/queries/useFileAsset';
import { useSaveFilesAuditEvent } from '../../../hooks/queries/useSaveFilesAuditEvent';
import { useUpdateFileLastViewedAt } from '../../../hooks/queries/useUpdateFileLastViewedAt';
import {
  selectContentRetrievalToken,
  selectIsSessionWarningPopUpShown,
  selectNonSingpassVerified,
  selectWarningDurationSecs,
} from '../../../store/slices/non-singpass-session';
import { selectOpenAttestation } from '../../../store/slices/open-attestation';
import { DocumentBottomSheet } from './components/bottom-sheet';
import { DocumentRenderer } from './components/document-renderer';
import { DocumentViewerHeader } from './components/document-viewer-header';
import { OAModal } from './components/oa-modal';
import { DocumentSideBar } from './components/side-bar';
import { StyledBodyContainer, StyledNavigationWrapper, StyledSidebarContainer, StyledWrapper } from './style';

type UrlParams = 'fileAssetUuid';

const RENDERER_FILE_TYPES = [FILE_TYPE.OA, FILE_TYPE.PDF];

function Document() {
  const oaLoaderRef = useRef<HTMLDivElement>(null);
  const params = useParams<UrlParams>();

  const isNonSingpassVerified = useAppSelector(selectNonSingpassVerified);
  const isSessionWarningPopUpShown = useAppSelector(selectIsSessionWarningPopUpShown);
  const warningDurationSecs = useAppSelector(selectWarningDurationSecs);
  const hasValidRetrivalToken = useAppSelector(selectContentRetrievalToken);

  const printPluginInstance = printPlugin();
  const { print: pdfPrint } = printPluginInstance;

  // Component Toggle
  const [tabSelected, setTabSelected] = useState(BOTTOM_SHEET_TAB.NONE_SELECTED);
  const [isOAModalOpen, setIsOAModalOpen] = useState(false);
  const [isFileHistoryModalOpen, setIsFileHistoryModalOpen] = useState(false);

  // Redux
  const { verificationResult, isTemplateRenderingComplete } = useAppSelector(selectOpenAttestation);
  const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);

  // ===========================================================================
  // Hooks
  // ===========================================================================
  const isLargerOrEqualToNormalTabletLandscape = useShouldRender(
    RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO,
    FSG_DEVICES.NORMAL_TABLET_LANDSCAPE,
  );

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  // Fetch file asset info
  const {
    data: fileAssetInfo,
    isFetching: isFetchingFileAssetInfo,
    error: fileAssetInfoError,
    refetch: fileAssetInfoRefetch,
  } = useFileAsset(params.fileAssetUuid, contentRetrievalToken);

  const isFileRenderable = !!fileAssetInfo && RENDERER_FILE_TYPES.includes(fileAssetInfo.type) && !fileAssetInfo.isDeleted;
  const isAcknowledgementNotRequiredOrIsAcknowledged =
    fileAssetInfo?.isAcknowledgementRequired === false || !!fileAssetInfo?.acknowledgedAt;

  // Download file
  const {
    data: downloadedFile,
    isFetching: isFetchingDownloadFile,
    error: downloadFileError,
    refetch: downloadFileRefetch,
  } = useDownloadFromS3(params.fileAssetUuid, contentRetrievalToken, {
    enabled: isFileRenderable && isAcknowledgementNotRequiredOrIsAcknowledged,
  });

  // Update lastViewedAt: error here should not affect user navigation through page
  const { mutateAsync: updateLastViewedAt } = useUpdateFileLastViewedAt(fileAssetInfo?.uuid, contentRetrievalToken);
  const { mutateAsync: saveFilesAuditEventAsync } = useSaveFilesAuditEvent(contentRetrievalToken);

  // Loader delay
  const { timerDone: show } = useTimer(MINIMUM_LOAD_DELAY_IN_MILLISECONDS, true);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handlePrintClick = useCallback(
    (fileType: FILE_TYPE, fileAssetUuid: string) => {
      saveFilesAuditEventAsync({
        fileAssetUuids: [fileAssetUuid],
        eventName: AUDIT_EVENT_NAME.USER_FILE_PRINT_SAVE,
      });

      switch (fileType) {
        case FILE_TYPE.OA:
          if (
            // Android
            navigator.userAgent.includes('SamsungBrowser') ||
            /\(Android (\d*\.?\d*?\.?\d*?); Mobile; rv:(\d*\.?\d*?\.?\d*?)\)/g.test(navigator.userAgent) || // Firefox Android: Mozilla/5.0 (Android 13; Mobile; rv:68.0) Gecko/68.0 Firefox/110.0
            // iOS
            navigator.userAgent.includes('CriOS') || // Chrome iOS: Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebkit/605.1.15 (KHTML, like Gecko) CriOS/110.1 Mobile/15E148 Safari/604.1
            navigator.userAgent.includes('FxiOS') || // Firefox iOS: Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebkit/605.1.15 (KHTML, like Gecko) FxiOS/110.1 Mobile/15E148 Safari/605.1.15
            navigator.userAgent.includes('OPT') || // Opera iOS: Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebkit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1 OPT/3.5.4
            navigator.userAgent.includes('EdgiOS') // Edge iOS: Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebkit/605.1.15 (KHTML, like Gecko) EdgiOS/110.0.1587.57 Version/16.0 Mobile/15E148 Safari/604.1
          ) {
            alert(
              'Printing this document is not optimised on your device.\nFor the best result, use: \n- Chrome on Android devices \n- Safari on IOS devices \n- Any major browsers on desktop',
            );
          }

          if (oaLoaderRef?.current) {
            (oaLoaderRef.current as any).print();
          }
          break;

        case FILE_TYPE.PDF:
          pdfPrint();
          break;

        default:
          break;
      }
    },
    [pdfPrint, saveFilesAuditEventAsync],
  );

  const handleDownloadClick = (blob: Blob, fileAssetName?: string) => {
    saveAs(blob, fileAssetName);
  };

  const handleOAModalOpen = () => {
    setTabSelected(BOTTOM_SHEET_TAB.NONE_SELECTED);

    setTimeout(() => {
      setIsOAModalOpen(true);
    }, 400);
  };

  const handleFileHistoryModalOpen = (delayMS = 0) => {
    setTabSelected(BOTTOM_SHEET_TAB.NONE_SELECTED);

    if (delayMS === 0) {
      setIsFileHistoryModalOpen(true);
      return;
    }

    setTimeout(() => {
      setIsFileHistoryModalOpen(true);
    }, delayMS);
  };

  const onFileHistoryCloseHandler = () => {
    setIsFileHistoryModalOpen(false);
  };

  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle(fileAssetInfo?.name, false);

  // ===========================================================================
  // Blocker prompt
  // ===========================================================================
  const { block, unblock } = useBlockerPrompt(
    'Are you sure you want to leave?\n\nYour session will be terminated and you will be required to verify your identity again to access your documents if you decide to leave.',
  );
  const { timerDone: blockerTimerDone, startTimer: startBlockerTimer } = useTimer((warningDurationSecs - 2) * 1000);

  useEffect(() => {
    if (isNonSingpassVerified) {
      block();
    }
  }, [block, isNonSingpassVerified, params.fileAssetUuid]);

  useEffect(() => {
    if (isSessionWarningPopUpShown) {
      startBlockerTimer();
    }
  }, [isSessionWarningPopUpShown, startBlockerTimer]);

  useEffect(() => {
    if (blockerTimerDone) {
      unblock();
    }
  }, [blockerTimerDone, unblock]);

  useEffect(() => {
    // Both POST requests, using mutateAsync to await the requests, to avoid CSRF tokens race
    async function updateLastViewedAtAndSaveAuditEvent() {
      if (isAcknowledgementNotRequiredOrIsAcknowledged) {
        await saveFilesAuditEventAsync({
          fileAssetUuids: [fileAssetInfo.uuid],
          eventName: AUDIT_EVENT_NAME.USER_FILE_VIEW,
        });
        await updateLastViewedAt();
      }
    }

    updateLastViewedAtAndSaveAuditEvent();
  }, [
    fileAssetInfo?.uuid,
    isAcknowledgementNotRequiredOrIsAcknowledged,
    saveFilesAuditEventAsync,
    updateLastViewedAt,
  ]);

  useEffect(() => {
    if (hasValidRetrivalToken === '') {
      unblock();
    }
  }, [hasValidRetrivalToken, unblock]);

  // ===========================================================================
  // Render
  // ===========================================================================
  // Loading
  const isFileAssetInfoLoading = isFetchingFileAssetInfo || (!isFetchingFileAssetInfo && !show);
  const isDownloadFileLoading = isFetchingDownloadFile || (!isFetchingDownloadFile && !show);

  // Render Logic
  const isTypeOA = fileAssetInfo?.type === FILE_TYPE.OA;
  const isDocumentUntampered = !!verificationResult?.documentIntegrity;
  const isTemplateRendereingCompleteAndUntamperedOA = isTemplateRenderingComplete && isDocumentUntampered;

  /**  Print button will be disabled if:
   * 1) File type has no renderer
   * 2) File is not downloaded
   * 3) File is type: OA and
   *   a) frame connector is not connected to renderer, and/or
   *   b) document is tampered with
   */
  const isPrintEnabled = (() => {
    if (!isFileRenderable) {
      return false;
    }

    if (!downloadedFile) {
      return false;
    }

    return isTypeOA ? isTemplateRendereingCompleteAndUntamperedOA : true;
  })();

  /** Download button will be disabled if:
   * 1) File is renderable but not downloaded
   * 2) File is not acknowledged if acknowledgement is required
   * 3) File is type: OA and document is tampered with
   */
  const isDownloadEnabled = (() => {
    if (isFileRenderable && !downloadedFile) {
      return false;
    }

    if (!isAcknowledgementNotRequiredOrIsAcknowledged) {
      return false;
    }

    return isTypeOA ? isDocumentUntampered : true;
  })();

  return (
    <StyledWrapper>
      <StyledNavigationWrapper>
        <DocumentViewerHeader fileAssetInfo={fileAssetInfo} isLoading={isFileAssetInfoLoading} onBackButtonClick={unblock} />
      </StyledNavigationWrapper>

      <StyledBodyContainer>
        <DocumentRenderer
          fileAssetInfo={fileAssetInfo}
          fileAssetInfoRefetch={fileAssetInfoRefetch}
          isLoadingFileAssetInfo={isFileAssetInfoLoading}
          downloadedBlob={downloadedFile?.blob}
          downloadFileRefetch={downloadFileRefetch}
          isLoadingDownloadFile={isDownloadFileLoading}
          ref={oaLoaderRef}
          fileAssetInfoError={fileAssetInfoError}
          downloadFileError={downloadFileError}
          printPluginInstance={printPluginInstance}
          onPreviousButtonClick={unblock}
          onNextButtonClick={unblock}
        />

        {isLargerOrEqualToNormalTabletLandscape ? (
          <StyledSidebarContainer>
            <DocumentSideBar
              fileAssetInfo={fileAssetInfo}
              isRenderableFile={isFileRenderable}
              handlePrintClick={() => fileAssetInfo && handlePrintClick(fileAssetInfo.type, fileAssetInfo.uuid)}
              handleDownloadClick={() => downloadedFile && handleDownloadClick(downloadedFile.blob, fileAssetInfo?.name)}
              handleOAModalOpen={handleOAModalOpen}
              isPrintEnabled={isPrintEnabled}
              isDownloadEnabled={isDownloadEnabled}
              handleFileHistoryModalOpen={handleFileHistoryModalOpen}
              isLoading={isFileAssetInfoLoading}
            />
          </StyledSidebarContainer>
        ) : (
          fileAssetInfo && (
            <DocumentBottomSheet
              fileAssetInfo={fileAssetInfo}
              isRenderableFile={isFileRenderable}
              handlePrintClick={() => handlePrintClick(fileAssetInfo.type, fileAssetInfo.uuid)}
              handleDownloadClick={() => downloadedFile && handleDownloadClick(downloadedFile.blob, fileAssetInfo.name)}
              handleOAModalOpen={handleOAModalOpen}
              isPrintEnabled={isPrintEnabled}
              isDownloadEnabled={isDownloadEnabled}
              tabSelected={tabSelected}
              setTabSelected={setTabSelected}
              handleFileHistoryModalOpen={() => handleFileHistoryModalOpen(600)}
            />
          )
        )}
      </StyledBodyContainer>
      {isOAModalOpen && <OAModal setIsOpen={setIsOAModalOpen} />}
      {fileAssetInfo && isFileHistoryModalOpen && <FileHistoryModal fileAssetId={fileAssetInfo.uuid} onClose={onFileHistoryCloseHandler} />}
    </StyledWrapper>
  );
}

export default Document;
