import { AUDIT_EVENT_NAME, FILE_TYPE, ViewableFileAssetResponse } from '@filesg/common';
import { Color, Icon, TextButton, Typography } from '@filesg/design-system';
import { useCallback, useEffect, useState } from 'react';

import { BOTTOM_SHEET_TAB, BottomSheet, TabObject } from '../../../../../components/data-display/bottom-sheet';
import { FileDetailsList } from '../../../../../components/data-display/file-detail-list';
import { TEST_IDS } from '../../../../../consts';
import { useDownloadAndSave } from '../../../../../hooks/common/useDownloadAndSave';
import { useAppSelector } from '../../../../../hooks/common/useSlice';
import { useSaveFilesAuditEvent } from '../../../../../hooks/queries/useSaveFilesAuditEvent';
import { selectContentRetrievalToken } from '../../../../../store/slices/non-singpass-session';
import { StyledFileDetailsContainer, StyledMoreActionsButton, StyledMoreActionsContainer, StyledOAButtonContainer } from './style';

interface Props {
  fileAssetInfo: ViewableFileAssetResponse;
  isRenderableFile: boolean;
  handlePrintClick: () => void;
  handleDownloadClick: () => void;
  handleOAModalOpen: () => void;
  isPrintEnabled: boolean;
  isDownloadEnabled: boolean;
  tabSelected: BOTTOM_SHEET_TAB;
  setTabSelected: React.Dispatch<React.SetStateAction<BOTTOM_SHEET_TAB>>;
  handleFileHistoryModalOpen: () => void;
}

export function DocumentBottomSheet({
  fileAssetInfo,
  isRenderableFile,
  handleOAModalOpen,
  handlePrintClick,
  handleDownloadClick,
  isPrintEnabled,
  isDownloadEnabled,
  tabSelected,
  setTabSelected,
  handleFileHistoryModalOpen,
}: Props) {
  const { uuid, name, type, size } = fileAssetInfo;
  const { handleDownloadAndSave } = useDownloadAndSave();
  const [tabObjects, setTabObjects] = useState<TabObject[]>([]);

  const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);
  const { mutate: saveFilesAuditEvent } = useSaveFilesAuditEvent(contentRetrievalToken);

  const handleDownloadClickWithEvtFire = useCallback(() => {
    saveFilesAuditEvent({
      fileAssetUuids: [uuid],
      eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
    });
    handleDownloadClick();
  }, [saveFilesAuditEvent, handleDownloadClick, uuid]);

  // Generate Tab objects
  useEffect(() => {
    const tabObjects: TabObject[] = [
      {
        label: BOTTOM_SHEET_TAB.FILE_DETAILS,
        icon: 'sgds-icon-list',
        content: (
          <StyledFileDetailsContainer key="bottom-sheet-file-details">
            {fileAssetInfo && (
              <FileDetailsList showTitle={false} file={fileAssetInfo} onViewFileHistoryClick={handleFileHistoryModalOpen} />
            )}
          </StyledFileDetailsContainer>
        ),
      },
      {
        label: BOTTOM_SHEET_TAB.MORE_ACTIONS,
        icon: 'sgds-icon-ellipsis',
        content: fileAssetInfo && (
          <StyledMoreActionsContainer key="bottom-sheet-more-actions">
            {isRenderableFile && (
              <StyledMoreActionsButton
                data-testid={TEST_IDS.BOTTOM_SHEET_PRINT_FILE_BUTTON}
                onClick={handlePrintClick}
                disabled={!isPrintEnabled}
              >
                <Icon icon="sgds-icon-print" />
                <Typography variant="BUTTON_NORMAL">{type === FILE_TYPE.OA ? 'Print or Save as PDF' : 'Print'}</Typography>
              </StyledMoreActionsButton>
            )}
            <StyledMoreActionsButton
              data-testid={TEST_IDS.BOTTOM_SHEET_DOWNLOAD_FILE_BUTTON}
              onClick={
                isRenderableFile
                  ? handleDownloadClickWithEvtFire
                  : () => handleDownloadAndSave([{ fileAssetUuid: uuid, fileName: name, fileSize: size }])
              }
              disabled={!isDownloadEnabled}
            >
              <Icon icon="sgds-icon-download" />
              <Typography variant="BUTTON_NORMAL">{type === FILE_TYPE.OA ? 'Download as OA' : 'Download'}</Typography>
            </StyledMoreActionsButton>

            {type === FILE_TYPE.OA && (
              <StyledOAButtonContainer>
                <TextButton
                  label="What is OA?"
                  startIcon="sgds-icon-circle-info"
                  color={Color.PURPLE_DEFAULT}
                  onClick={handleOAModalOpen}
                />
              </StyledOAButtonContainer>
            )}
          </StyledMoreActionsContainer>
        ),
      },
    ];

    setTabObjects(tabObjects);
  }, [
    fileAssetInfo,
    handleDownloadAndSave,
    handleFileHistoryModalOpen,
    handleOAModalOpen,
    handlePrintClick,
    isDownloadEnabled,
    isPrintEnabled,
    isRenderableFile,
    name,
    type,
    uuid,
    size,
    handleDownloadClickWithEvtFire,
  ]);

  return <BottomSheet tabObjects={tabObjects} tabSelected={tabSelected} setTabSelected={setTabSelected} />;
}
