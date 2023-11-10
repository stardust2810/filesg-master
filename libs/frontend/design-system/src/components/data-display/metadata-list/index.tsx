import { FILE_TYPE } from '@filesg/common';
import { isValidElement } from 'react';

import { Color } from '../../../styles/color';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { TextButton } from '../../inputs/text-button';
import { FileIcon } from '../file-icon';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { DetailsLabel } from './details-label';
import {
  StyledContainer,
  StyledFilePreviewContainer,
  StyledHeaderContainer,
  StyledItemContainer,
  StyledPreviewFile,
  StyledPreviewFileShadow,
} from './style';

export interface MetadataField {
  field: string;
  value: string;
  tooltipDescription?: string;
}
interface Props {
  title?: string;
  titleIcon?: IconLiterals;
  metadata?: MetadataField[];
  thumbnailComponent?: JSX.Element;
  thumbnailDocumentType?: FILE_TYPE;
  showThumbnailShadow?: boolean;
  footerDescription?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export const MetadataList = ({
  title,
  titleIcon,
  metadata = [],
  thumbnailComponent,
  thumbnailDocumentType,
  showThumbnailShadow = false,
  buttonLabel,
  onButtonClick,
  footerDescription,
}: Props) => {
  const MetadataListThumbnail = () => {
    if (isValidElement(thumbnailComponent)) {
      return thumbnailComponent;
    }
    if (thumbnailDocumentType) {
      return (
        <StyledFilePreviewContainer data-testid={TEST_IDS.METADATA_LIST_THUMBNAIL}>
          <StyledPreviewFile>
            <FileIcon type={thumbnailDocumentType} variant="solid" size="ICON_LARGE" />
          </StyledPreviewFile>
          {showThumbnailShadow && <StyledPreviewFileShadow />}
        </StyledFilePreviewContainer>
      );
    }
    return null;
  };
  return (
    <StyledContainer data-testid={TEST_IDS.METADATA_LIST}>
      {title && (
        <StyledHeaderContainer>
          {titleIcon && <Icon icon={titleIcon} color={Color.GREY30} />}
          <Typography variant="PARAGRAPH" bold="FULL" data-testid={TEST_IDS.METADATA_LIST_HEADER}>
            {title}
          </Typography>
        </StyledHeaderContainer>
      )}
      <MetadataListThumbnail />
      <StyledItemContainer>
        {metadata.map((detailInfo, index) => {
          const { field, value, tooltipDescription } = detailInfo;
          if (!value) {
            return null;
          }

          return (
            <DetailsLabel
              data-testid={`${TEST_IDS.METADATA_LIST_ITEM}-${index}`}
              field={field}
              value={value}
              tooltipInfo={tooltipDescription}
              keyIndex={index}
              key={`file-details-item-${index}`}
            />
          );
        })}

        {buttonLabel && onButtonClick && (
          <TextButton label={buttonLabel} startIcon="sgds-icon-privacy-alt" color={Color.PURPLE_DEFAULT} onClick={onButtonClick} />
        )}
        {footerDescription && <Typography variant="BODY">{footerDescription}</Typography>}
      </StyledItemContainer>
    </StyledContainer>
  );
};
