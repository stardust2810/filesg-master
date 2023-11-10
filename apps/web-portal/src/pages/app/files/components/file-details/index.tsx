import { pluralise } from '@filesg/common';
import { MetadataList } from '@filesg/design-system';
import { useState } from 'react';

import FolderImage from '../../../../../assets/images/files/files-preview-folder.svg';
import { FileDetailsList } from '../../../../../components/data-display/file-detail-list';
import { FileHistoryModal } from '../../../../../components/feedback/modal/file-history-modal';
import { TEST_IDS } from '../../../../../consts';
import { FileTableData } from '../..';
import { StyledContainer, StyledFilePreviewContainer, StyledFolderImage } from './style';

type Props = {
  title: string;
  selectedFiles: FileTableData[];
  filesTotalCount: number;
  activeFilter?: string | null;
};

export function FileDetails({ title, selectedFiles, filesTotalCount, activeFilter }: Props) {
  const numberOfSelectedFiles = selectedFiles.length;
  const [showFileHistory, setShowFileHistory] = useState(false);

  const onViewFileHistoryClicked = () => {
    setShowFileHistory(true);
  };

  const onFileHistoryCloseHandler = () => {
    setShowFileHistory(false);
  };

  const SelectedFilesDetail = () => {
    if (numberOfSelectedFiles > 1) {
      return (
        <FileDetailsList
          titleIcon="sgds-icon-folder"
          footerDescription={`Selected ${numberOfSelectedFiles} ${pluralise(numberOfSelectedFiles, 'file')}`}
          showFileThumbnail={true}
          showThumbnailShadow={true}
        />
      );
    }

    if (numberOfSelectedFiles === 1) {
      return (
        <FileDetailsList
          showFileThumbnail={true}
          documentType={selectedFiles[0].documentType}
          file={selectedFiles[0]}
          onViewFileHistoryClick={onViewFileHistoryClicked}
        />
      );
    }

    if (activeFilter) {
      const fileCount = filesTotalCount < 1 ? 0 : filesTotalCount;

      return (
        <FileDetailsList
          title="Filter"
          titleIcon="sgds-icon-filter"
          footerDescription={`${fileCount} ${pluralise(fileCount, 'result')}`}
          showFileThumbnail={true}
          showThumbnailShadow={true}
        />
      );
    }
    const fileCount = filesTotalCount < 1 ? 0 : filesTotalCount;

    return (
      <MetadataList
        title={title}
        titleIcon={'sgds-icon-folder'}
        thumbnailComponent={
          <StyledFilePreviewContainer data-testid={TEST_IDS.FILE_PREVIEW}>
            <StyledFolderImage src={FolderImage} alt="folder" />
          </StyledFilePreviewContainer>
        }
        footerDescription={`Contains ${fileCount} ${pluralise(fileCount, 'file')}`}
      />
    );
  };

  return (
    <StyledContainer data-testid={TEST_IDS.FILE_DETAILS}>
      {showFileHistory && <FileHistoryModal fileAssetId={selectedFiles[0].id} onClose={onFileHistoryCloseHandler}></FileHistoryModal>}
      <SelectedFilesDetail />
    </StyledContainer>
  );
}
