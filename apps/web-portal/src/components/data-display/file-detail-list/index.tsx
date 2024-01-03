import { FILE_TYPE, ViewableFileAssetResponse } from '@filesg/common';
import { DATE_FORMAT_PATTERNS, IconLiterals, MetadataList } from '@filesg/design-system';

import { FileTableData } from '../../../pages/app/files';
import { formatBytes, formatDate } from '../../../utils/common';

export interface DetailField {
  field: string;
  value: string;
  tooltipDescription?: string;
}

interface Props {
  title?: string;
  titleIcon?: IconLiterals;
  file?: FileTableData | ViewableFileAssetResponse;
  details?: DetailField[];
  /**
   * showFileThumbnail is used in My Files page to show the thumbnail
   */
  showFileThumbnail?: boolean;
  /**
   * documentType is used to determine the thumbnail to be displayed
   */
  documentType?: FILE_TYPE;
  showTitle?: boolean;
  footerDescription?: string;
  showThumbnailShadow?: boolean;
  onViewFileHistoryClick?: () => void;
}
const TITLE = 'File Details';
const TITLE_ICON = 'sgds-icon-list';
const ACCESS_UNTIL_TOOLTIP_INFO = 'This file is scheduled to be deleted after this date.';
const VIEW_FILE_HISTORY_LABEL = 'View File History';
const PASSWORD_PROTECTED_TOOLTIP_INFO = 'This file is protected with a password which can be found in the issuance email.';

export const FileDetailsList = ({
  title = TITLE,
  titleIcon = TITLE_ICON,
  showFileThumbnail = false,
  documentType = FILE_TYPE.UNKNOWN,
  onViewFileHistoryClick,
  showTitle = true,
  footerDescription,
  showThumbnailShadow = false,
  file,
}: Props) => {
  const getDetails = () => {
    if (!file) {
      return [];
    }
    const { name, size, ownerName, agencyName, agencyCode, createdAt, expireAt, deleteAt, isPasswordEncrypted, externalRefId } = file;
    const details: DetailField[] = [
      {
        field: 'File Name',
        value: name,
      },
      {
        field: 'Owner',
        value: ownerName ?? '-',
      },
      {
        field: 'Agency Ref No.',
        value: externalRefId ?? '-',
      },
      {
        field: 'Created',
        value: formatDate(`${createdAt}`, DATE_FORMAT_PATTERNS.DATE_TIME),
      },
      {
        field: 'Size',
        value: formatBytes(size),
      },
    ];

    if (agencyName) {
      const ownerIndex = details.findIndex((item) => item.field === 'Owner');
      details.splice(ownerIndex + 1, 0, {
        field: 'Issued By',
        value: `${agencyName} (${agencyCode})`,
      });
    }

    if (expireAt) {
      const createdIndex = details.findIndex((item) => item.field === 'Created');
      details.splice(createdIndex + 1, 0, {
        field: 'Expiry Date',
        value: formatDate(`${expireAt}`, DATE_FORMAT_PATTERNS.DATE),
      });
    }

    if (deleteAt) {
      const accessUntil = new Date(deleteAt);
      accessUntil.setDate(accessUntil.getDate() - 1);

      const createdIndex = details.findIndex((item) => item.field === 'Created');
      details.splice(createdIndex + 1, 0, {
        field: 'Access Until',
        value: formatDate(`${accessUntil}`, DATE_FORMAT_PATTERNS.DATE),
        tooltipDescription: ACCESS_UNTIL_TOOLTIP_INFO,
      });
    }

    if (isPasswordEncrypted) {
      const sizeIndex = details.findIndex((item) => item.field === 'Size');
      details.splice(sizeIndex + 1, 0, {
        field: 'Password Protected',
        value: 'Yes',
        tooltipDescription: PASSWORD_PROTECTED_TOOLTIP_INFO,
      });
    }
    return details;
  };
  return (
    <MetadataList
      title={showTitle ? title : undefined}
      titleIcon={titleIcon}
      thumbnailDocumentType={showFileThumbnail ? documentType : undefined}
      showThumbnailShadow={showThumbnailShadow}
      metadata={getDetails()}
      buttonLabel={VIEW_FILE_HISTORY_LABEL}
      onButtonClick={onViewFileHistoryClick}
      footerDescription={footerDescription}
    />
  );
};
