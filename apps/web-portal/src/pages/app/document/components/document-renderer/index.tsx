import { FILE_TYPE, ViewableFileAssetResponse } from '@filesg/common';
import { Button, FileSpinner, FSG_DEVICES, RESPONSIVE_VARIANT, ResponsiveRenderer } from '@filesg/design-system';
import { PrintPlugin } from '@react-pdf-viewer/print';
import { AxiosError } from 'axios';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { OADocumentLoader } from '../../../../../components/inputs/oa-document-loader';
import { WebPage } from '../../../../../consts';
import {
  FILE_DELETED_ERROR,
  FILE_NOT_FOUND_ERROR,
  FILE_NOT_LOADED_ERROR,
  FILE_PENDING_ACKNOWLEDGEMENT_ERROR,
  FILE_PREVIEW_NOT_AVAILABLE_ERROR,
} from '../../../../../consts/error';
import { useDownloadAndSave } from '../../../../../hooks/common/useDownloadAndSave';
import { useAppSelector } from '../../../../../hooks/common/useSlice';
import { selectNonSingpassVerified } from '../../../../../store/slices/non-singpass-session';
import { NavigationButton } from './components/navigation-button';
import { PDFRenderer } from './components/pdf-renderer';
import { StyledErrorInfo, StyledInfoContainer, StyledPlaceholderRenderer, StyledRendererContainer } from './style';

export enum NAVIGATION_DIRECTION {
  NEXT = 'next',
  PREVIOUS = 'previous',
}
export interface FilesPageLocationState extends BaseDocumentLocationState {
  folder?: string;
}

export interface BaseDocumentLocationState {
  fileAssetUuids: string[];
  prevPath?: string;
}

interface Props {
  fileAssetInfo?: ViewableFileAssetResponse;
  fileAssetInfoRefetch: () => void;
  isLoadingFileAssetInfo: boolean;
  downloadedBlob?: Blob;
  downloadFileRefetch: () => void;
  isLoadingDownloadFile: boolean;
  fileAssetInfoError: AxiosError | null;
  downloadFileError: AxiosError | null;
  printPluginInstance: PrintPlugin;
  onPreviousButtonClick?: () => void;
  onNextButtonClick?: () => void;
}

const { image: notLoadedImage, title: notLoadedTitle, descriptions: notLoadedDescriptions } = FILE_NOT_LOADED_ERROR;
const { image: notFoundImage, title: notFoundTitle, descriptions: notFoundDescriptions } = FILE_NOT_FOUND_ERROR;
const {
  image: filePreviewNotAvailableErrorImage,
  title: filePreviewNotAvailableErrorTitle,
  descriptions: filePreviewNotAvailableErrorDescriptions,
} = FILE_PREVIEW_NOT_AVAILABLE_ERROR;
const { image: deletedImage, title: deletedTitle, descriptions: deletedDescriptions } = FILE_DELETED_ERROR;
const {
  image: pendingAcknowledgementImage,
  title: pendingAcknowledgementTitle,
  descriptions: pendingAcknowledgementDescriptions,
} = FILE_PENDING_ACKNOWLEDGEMENT_ERROR;

export const DocumentRenderer = forwardRef(
  (
    {
      fileAssetInfo,
      fileAssetInfoRefetch,
      isLoadingFileAssetInfo,
      downloadedBlob,
      downloadFileRefetch,
      isLoadingDownloadFile,
      fileAssetInfoError,
      downloadFileError,
      printPluginInstance,
      onPreviousButtonClick,
      onNextButtonClick,
    }: Props,
    ref,
  ) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isNonSingpassVerified = useAppSelector(selectNonSingpassVerified);

    const [fileAssetUuids, setFileAssetUuids] = useState<string[]>([]);

    // ===========================================================================
    // Handlers
    // ===========================================================================
    const { handleDownloadAndSave } = useDownloadAndSave();

    const handleFileTypeRenderer = useCallback(
      (fileAssetInfo: ViewableFileAssetResponse, blob: Blob | undefined) => {
        const { uuid, type, name, size } = fileAssetInfo;

        switch (type) {
          case FILE_TYPE.OA:
            return blob && <OADocumentLoader fileAssetUuid={uuid} blob={blob} ref={ref} showQr showFullDetails showPassIfStatusInvalid />;
          case FILE_TYPE.PDF:
            return blob && <PDFRenderer blob={blob} printPluginInstance={printPluginInstance} />;
          default:
            return (
              <StyledInfoContainer>
                <StyledErrorInfo
                  image={filePreviewNotAvailableErrorImage}
                  title={filePreviewNotAvailableErrorTitle}
                  descriptions={filePreviewNotAvailableErrorDescriptions}
                  isCentered
                >
                  <Button
                    label="Download File"
                    onClick={() => handleDownloadAndSave([{ fileAssetUuid: uuid, fileName: name, fileSize: size }])}
                  />
                </StyledErrorInfo>
              </StyledInfoContainer>
            );
        }
      },
      [handleDownloadAndSave, printPluginInstance, ref],
    );

    const handleDocumentNavigation = useCallback(
      (currentFileAssetUuid: string, fileAssetIds: string[], direction: NAVIGATION_DIRECTION) => {
        const currentFileIndex = fileAssetIds.findIndex((fileAssetUuid) => fileAssetUuid === currentFileAssetUuid);

        if (direction === NAVIGATION_DIRECTION.NEXT) {
          const nextFileIndex = currentFileIndex + 1;

          if (nextFileIndex > fileAssetIds.length - 1) {
            return;
          }

          navigate(`../${fileAssetIds[nextFileIndex]}`, { state: location.state });
        } else {
          const previousFileIndex = currentFileIndex - 1;

          if (previousFileIndex < 0) {
            return;
          }

          navigate(`../${fileAssetIds[previousFileIndex]}`, { state: location.state });
        }
      },
      [location.state, navigate],
    );

    const handlePreviousButtonClick = useCallback(
      (fileAssetInfo: ViewableFileAssetResponse) => {
        onPreviousButtonClick?.();
        handleDocumentNavigation(fileAssetInfo.uuid, fileAssetUuids, NAVIGATION_DIRECTION.PREVIOUS);
      },
      [fileAssetUuids, handleDocumentNavigation, onPreviousButtonClick],
    );

    const handleNextButtonClick = useCallback(
      (fileAssetInfo: ViewableFileAssetResponse) => {
        onNextButtonClick?.();
        handleDocumentNavigation(fileAssetInfo.uuid, fileAssetUuids, NAVIGATION_DIRECTION.NEXT);
      },
      [fileAssetUuids, handleDocumentNavigation, onNextButtonClick],
    );

    // ===========================================================================
    // UseEffects
    // ===========================================================================
    // Set fileAsset Uuid list
    useEffect(() => {
      const tempList = (location?.state as BaseDocumentLocationState | FilesPageLocationState)?.fileAssetUuids;
      if (tempList) {
        setFileAssetUuids(tempList);
      }
    }, [location?.state]);

    // =========================================================================
    // Render
    // =========================================================================
    const renderBodyContent = useCallback(() => {
      const isPendingAcknowledgement = !!fileAssetInfo && fileAssetInfo.isAcknowledgementRequired && !fileAssetInfo.acknowledgedAt;

      switch (true) {
        // Loading
        case isLoadingFileAssetInfo || isLoadingDownloadFile:
          return (
            <StyledPlaceholderRenderer>
              <FileSpinner>Loading file...</FileSpinner>
            </StyledPlaceholderRenderer>
          );

        // File not found Error
        case fileAssetInfoError?.response?.status === 404:
          return (
            <StyledInfoContainer>
              <StyledErrorInfo image={notFoundImage} title={notFoundTitle} descriptions={notFoundDescriptions} isCentered />
            </StyledInfoContainer>
          );

        // Generic fileAssetInfo or download Error
        case !!fileAssetInfoError || !!downloadFileError:
          return (
            <StyledInfoContainer>
              <StyledErrorInfo image={notLoadedImage} title={notLoadedTitle} descriptions={notLoadedDescriptions} isCentered>
                <Button
                  label="Reload Page"
                  onClick={() => {
                    if (fileAssetInfoError) {
                      fileAssetInfoRefetch();
                    }
                    if (downloadFileError) {
                      downloadFileRefetch();
                    }
                  }}
                />
              </StyledErrorInfo>
            </StyledInfoContainer>
          );

        // File deleted by agency
        case fileAssetInfo?.isDeleted:
          return (
            <StyledInfoContainer>
              <StyledErrorInfo image={deletedImage} title={deletedTitle} descriptions={deletedDescriptions} isCentered>
                {fileAssetInfo?.receiveDeleteActivityUuid && (
                  <Button
                    label="Go to Activity"
                    onClick={() => navigate(`${WebPage.ACTIVITIES}/${fileAssetInfo.receiveDeleteActivityUuid}`)}
                  />
                )}
              </StyledErrorInfo>
            </StyledInfoContainer>
          );

        // Acknowledgement
        case isPendingAcknowledgement:
          return (
            <StyledInfoContainer>
              <StyledErrorInfo
                image={pendingAcknowledgementImage}
                title={pendingAcknowledgementTitle}
                descriptions={pendingAcknowledgementDescriptions}
                isCentered
              >
                {/* Non-null assertion because fileAssetInfo is checked in case boolean */}
                {!isNonSingpassVerified && (
                  <Button
                    label="Go to Activity"
                    onClick={() => navigate(`${WebPage.ACTIVITIES}/${fileAssetInfo!.receiveTransferActivityUuid}`)}
                  />
                )}
              </StyledErrorInfo>
            </StyledInfoContainer>
          );

        // File type renderer
        default:
          return handleFileTypeRenderer(fileAssetInfo!, downloadedBlob);
      }
    }, [
      downloadFileError,
      downloadFileRefetch,
      downloadedBlob,
      fileAssetInfo,
      fileAssetInfoError,
      fileAssetInfoRefetch,
      handleFileTypeRenderer,
      isLoadingDownloadFile,
      isLoadingFileAssetInfo,
      isNonSingpassVerified,
      navigate,
    ]);

    return (
      <StyledRendererContainer>
        {renderBodyContent()}

        {fileAssetInfo && fileAssetUuids.length > 1 && (
          <ResponsiveRenderer variant={RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO} device={FSG_DEVICES.SMALL_TABLET}>
            <>
              <NavigationButton
                direction={NAVIGATION_DIRECTION.PREVIOUS}
                onClick={() => handlePreviousButtonClick(fileAssetInfo)}
                disabled={fileAssetUuids.indexOf(fileAssetInfo.uuid) === 0}
                aria-label="Previous File"
              />
              <NavigationButton
                direction={NAVIGATION_DIRECTION.NEXT}
                onClick={() => handleNextButtonClick(fileAssetInfo)}
                disabled={fileAssetUuids.indexOf(fileAssetInfo.uuid) === fileAssetUuids.length - 1}
                aria-label="Next File"
              />
            </>
          </ResponsiveRenderer>
        )}
      </StyledRendererContainer>
    );
  },
);
