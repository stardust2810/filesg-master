import React from 'react';

import { useShouldRender } from '../../../hooks/useShouldRender';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Tag } from '../tag';
import { Typography } from '../typography';
import { StyledContainer, StyledDescriptionContainer, StyledImage, StyledTitleTagContainer } from './style';

export const DEFAULT_IMG_ALT = '';

export type Props = {
  /**
   * Path to image
   */
  image: string;
  /**
   * Text to be shown as tag
   */
  tagText?: string;
  /**
   * Title to be displayed
   */
  title: string | React.ReactElement;
  /**
   * Description to be displayed
   */
  descriptions?: (string | React.ReactElement)[];
  /**
   * Flag to decide if components should be centered
   */
  isCentered?: boolean;
  /**
   * Alt text for image
   */
  imageAltText?: string;
} & FileSGProps;

/**
 * Info is a molecule component that is used to surface information to users
 */
export const Info = ({ image, tagText, title, descriptions, className, isCentered = false, imageAltText, ...rest }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  return (
    <StyledContainer isCentered={isCentered} className={className} data-testid={rest['data-testid'] ?? TEST_IDS.INFO}>
      <StyledImage src={image} alt={imageAltText ?? DEFAULT_IMG_ALT} data-testid={`${TEST_IDS.INFO_IMAGE}`} />
      <StyledTitleTagContainer>
        {tagText && (
          <Tag variant="FILLED" color="PRIMARY">
            {tagText}
          </Tag>
        )}

        {React.isValidElement(title) ? (
          title
        ) : (
          <Typography variant={isSmallerThanSmallTablet ? 'H2_MOBILE' : 'H2'} bold="FULL" data-testid={`${TEST_IDS.INFO_TITLE}`}>
            {title}
          </Typography>
        )}
      </StyledTitleTagContainer>
      {descriptions && (
        <StyledDescriptionContainer>
          {descriptions.map((description, index) => {
            return React.isValidElement(description) ? (
              description
            ) : (
              <Typography variant="BODY" key={`${TEST_IDS.INFO_DESCRIPTION}-${index}`} data-testid={`${TEST_IDS.INFO_DESCRIPTION}`}>
                {description}
              </Typography>
            );
          })}
        </StyledDescriptionContainer>
      )}
    </StyledContainer>
  );
};
