import { AUDIT_EVENT_NAME, transformDateToFilenameString } from '@filesg/common';
import { Bold, Button, Color, sendToastMessage, Typography, updateToastMessage } from '@filesg/design-system';
import { AxiosError } from 'axios';
import saveAs from 'file-saver';
import { useCallback } from 'react';
import { Id } from 'react-toastify';
import styled from 'styled-components';

import { selectContentRetrievalToken } from '../../store/slices/non-singpass-session';
import { downloadFromS3 } from '../queries/useDownloadFromS3';
import { useSaveFilesAuditEvent } from '../queries/useSaveFilesAuditEvent';
import { useAppSelector } from './useSlice';

export interface DownloadAndSaveFileAssetDetails {
  fileAssetUuid: string;
  fileSize: number;
  fileName: string;
}

export function useDownloadAndSave() {
  const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);
  const { mutate: saveFilesAuditEvent } = useSaveFilesAuditEvent(contentRetrievalToken);

  const handleDownloadAndSave = useCallback(
    async (fileAssetDetailsList: DownloadAndSaveFileAssetDetails[]) => {
      const numberOfFiles = fileAssetDetailsList.length;

      const downloadFileAssetUuids = fileAssetDetailsList.map((fileAssetDetails) => {
        return fileAssetDetails.fileAssetUuid;
      });

      let downloadFileName = fileAssetDetailsList[0].fileName;
      let downloadTotalFileSize = fileAssetDetailsList[0].fileSize;

      if (numberOfFiles > 1) {
        let totalFileNameLength = 0;
        let totalFileSize = 0;

        fileAssetDetailsList.forEach((fileAssetDetails) => {
          totalFileNameLength += fileAssetDetails.fileName.length;
          totalFileSize += fileAssetDetails.fileSize;
        });

        // NOTE: Formula only works for no compression / compression level = 0
        downloadTotalFileSize = numberOfFiles * (30 + 16 + 46) + 2 * totalFileNameLength + totalFileSize + 22;

        downloadFileName = `filesg-download-${transformDateToFilenameString(new Date())}.zip`;
      }

      const controller = new AbortController();
      const toastId = sendDownloadToast(downloadFileName, downloadTotalFileSize, controller);

      try {
        saveFilesAuditEvent({
          fileAssetUuids: downloadFileAssetUuids,
          eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
        });
        const { blob } = await downloadFromS3(
          downloadFileAssetUuids,
          contentRetrievalToken,
          controller.signal,
          onDownloadProgress(toastId, downloadFileName, downloadTotalFileSize),
        );

        handleDownloadSuccess(blob, toastId, downloadFileName);
      } catch (error) {
        // Axios abort message
        if ((error as AxiosError).message === 'canceled') {
          return;
        }

        handleDownloadError(toastId, downloadFileName);
      }
    },
    [contentRetrievalToken, saveFilesAuditEvent],
  );

  return { handleDownloadAndSave };
}

const sendDownloadToast = (fileName: string, fileSize: number, abortController: AbortController) =>
  sendToastMessage(
    <StyledToastTextContainer>
      <StyledToastText variant="BODY">
        Downloading <Bold type="FULL">{fileName}</Bold>
      </StyledToastText>

      <Typography variant="SMALL" color={Color.GREY30}>
        {getFileProgress(0, fileSize)}
      </Typography>
    </StyledToastTextContainer>,
    'progress',
    {
      autoClose: false,
      hideProgressBar: false,
      progress: 0,
      progressStyle: { background: Color.GREY30, height: '0.5rem' },
      role: 'status',
      closeButton: ({ closeToast }) => (
        <Button
          aria-label="Cancel Download"
          bold="FULL"
          decoration="GHOST"
          color={{ DARKER: '#AFABED', DEFAULT: '#AFABED', LIGHTEST: '#1E1E1E' }}
          label="CANCEL"
          size="SMALL"
          onClick={(e) => {
            abortController.abort();
            closeToast(e);
          }}
          hasRippleAnimation={false}
        />
      ),
    },
  );

const onDownloadProgress = (toastId: Id, fileName: string, fileSize: number) => (progressEvent: ProgressEvent) => {
  const { loaded } = progressEvent;
  const progress = loaded / fileSize;

  updateToastMessage(toastId, 'progress', {
    progress,
    role: undefined,
    render: (
      <StyledToastTextContainer>
        <StyledToastText variant="BODY">
          Downloading <Bold type="FULL">{fileName}</Bold>
        </StyledToastText>

        <Typography variant="SMALL" color={Color.GREY30}>
          {getFileProgress(loaded, fileSize)}
        </Typography>
      </StyledToastTextContainer>
    ),
  });
};

const handleDownloadSuccess = (blob: Blob, toastId: Id, fileName: string) => {
  saveAs(blob, fileName);

  updateToastMessage(toastId, 'success', {
    render: (
      <StyledToastText variant="BODY">
        <Bold type="FULL">{fileName}</Bold> was successfully downloaded
      </StyledToastText>
    ),
    draggable: true,
    hideProgressBar: true,
    autoClose: 5000,
    role: 'status',
  });
};

const handleDownloadError = (toastId: Id, fileName: string) =>
  updateToastMessage(toastId, 'error', {
    render: (
      <StyledToastText variant="BODY">
        Error downloading <Bold type="FULL">{fileName}</Bold>
      </StyledToastText>
    ),
    draggable: true,
    hideProgressBar: true,
    role: 'alert',
  });

function getFileProgress(loaded: number, total: number) {
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(total) / Math.log(k));
  const fractionDigits = i <= 1 ? 0 : 2;

  return `${(loaded / Math.pow(k, i)).toFixed(fractionDigits)} / ${(total / Math.pow(k, i)).toFixed(fractionDigits)} ${sizes[i]}`;
}

const StyledToastTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S4};
`;

const StyledToastText = styled(Typography)`
  word-break: break-word;
`;
