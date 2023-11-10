import { AUDIT_EVENT_NAME, FILE_TYPE, ViewableFileAssetResponse } from '@filesg/common';
import { Button, Color, Icon, TextButton, Typography } from '@filesg/design-system';
import { useCallback } from 'react';

import { FileDetailsList } from '../../../../../components/data-display/file-detail-list';
import { ItemDetailsSkeleton } from '../../../../../components/feedback/skeleton-loader/item-details-skeleton';
import { TEST_IDS } from '../../../../../consts';
import { useDownloadAndSave } from '../../../../../hooks/common/useDownloadAndSave';
import { useAppSelector } from '../../../../../hooks/common/useSlice';
import { useSaveFilesAuditEvent } from '../../../../../hooks/queries/useSaveFilesAuditEvent';
import { selectContentRetrievalToken } from '../../../../../store/slices/non-singpass-session';
import { MoreActionsSkeleton } from './components/more-actions-skeleton-loader';
import { StyledFileDetailsContainer, StyledHeaderContainer, StyledMoreActionsContainer } from './style';

interface Props {
  fileAssetInfo: ViewableFileAssetResponse | undefined;
  isRenderableFile: boolean;
  handlePrintClick: () => void;
  handleDownloadClick: () => void;
  handleOAModalOpen: () => void;
  isPrintEnabled: boolean;
  isDownloadEnabled: boolean;
  handleFileHistoryModalOpen: () => void;
  isLoading: boolean;
}

export function DocumentSideBar({
  fileAssetInfo,
  isRenderableFile,
  handlePrintClick,
  handleDownloadClick,
  handleOAModalOpen,
  isPrintEnabled,
  isDownloadEnabled,
  handleFileHistoryModalOpen,
  isLoading,
}: Props) {
  const { handleDownloadAndSave } = useDownloadAndSave();
  const hasNoFileAssetInfo = (!isLoading && !fileAssetInfo) || fileAssetInfo?.isDeleted;

  const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);
  const { mutate: saveFilesAuditEvent } = useSaveFilesAuditEvent(contentRetrievalToken);

  const handleDownloadClickWithEvtFire = useCallback(() => {
    saveFilesAuditEvent({
      fileAssetUuids: [fileAssetInfo!.uuid],
      eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
    });
    handleDownloadClick();
  }, [saveFilesAuditEvent, fileAssetInfo, handleDownloadClick]);

  return !hasNoFileAssetInfo ? (
    <>
      <StyledMoreActionsContainer>
        {isLoading ? (
          <MoreActionsSkeleton />
        ) : (
          fileAssetInfo && (
            <>
              <StyledHeaderContainer>
                <Icon icon="sgds-icon-list" color={Color.GREY30} />
                <Typography variant="PARAGRAPH" bold="FULL">
                  More Actions
                </Typography>
              </StyledHeaderContainer>

              {isRenderableFile && (
                <Button
                  label={fileAssetInfo.type === FILE_TYPE.OA ? 'Print or Save as PDF' : 'Print'}
                  color="DEFAULT"
                  fullWidth
                  size="NORMAL"
                  endIcon="sgds-icon-print"
                  onClick={handlePrintClick}
                  data-testid={TEST_IDS.PRINT_FILE_BUTTON}
                  disabled={!isPrintEnabled}
                />
              )}

              <Button
                label={fileAssetInfo.type === FILE_TYPE.OA ? 'Download as OA' : 'Download'}
                color="DEFAULT"
                decoration={isRenderableFile ? 'OUTLINE' : 'SOLID'}
                fullWidth
                size="NORMAL"
                endIcon="sgds-icon-download"
                onClick={
                  isRenderableFile
                    ? handleDownloadClickWithEvtFire
                    : () =>
                        handleDownloadAndSave([
                          { fileAssetUuid: fileAssetInfo.uuid, fileName: fileAssetInfo.name, fileSize: fileAssetInfo.size },
                        ])
                }
                data-testid={TEST_IDS.DOWNLOAD_FILE_BUTTON}
                disabled={!isDownloadEnabled}
              />

              {fileAssetInfo.type === FILE_TYPE.OA && (
                <TextButton
                  label="What is OA?"
                  startIcon="sgds-icon-circle-info"
                  color={Color.PURPLE_DEFAULT}
                  onClick={handleOAModalOpen}
                />
              )}
            </>
          )
        )}
      </StyledMoreActionsContainer>

      <StyledFileDetailsContainer>
        {isLoading ? (
          <ItemDetailsSkeleton />
        ) : (
          fileAssetInfo && <FileDetailsList showTitle={true} file={fileAssetInfo} onViewFileHistoryClick={handleFileHistoryModalOpen} />
        )}
      </StyledFileDetailsContainer>
    </>
  ) : null;
}
