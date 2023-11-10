import React from 'react';

import { Color } from '../../../styles/color';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { ButtonColorsTheme, FILE_ICON_VARIANT, FILE_TYPE, FileSGProps } from '../../../utils/typings';
import { IconButton } from '../../inputs/icon-button';
import { FileIcon } from '../file-icon';
import { Icon } from '../icon';
import { Tag } from '../tag';
import { Typography } from '../typography';
import {
  StyledButtonContainer,
  StyledContainer,
  StyledFileContainer,
  StyledFileDetailsContainer,
  StyledFileDetailsTextContainer,
  StyledFileIconContainer,
  StyledFileNameText,
  StyledIconLabel,
} from './style';

export type Props = {
  /**
   * File type
   */
  type: FILE_TYPE;
  /**
   * File name
   */
  name: string;
  /**
   * File size
   */
  size: string;
  /**
   * Link to file
   */
  linkTo: string;
  /**
   * Link state that needs to be passed to router
   */
  linkState?: any;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Icon to display
   */
  icon?: IconLiterals;
  /**
   * Icon colour
   */
  iconColor?: ButtonColorsTheme;
  /**
   * Icon style variant
   */
  iconVariant: FILE_ICON_VARIANT;
  /**
   * Callback when icon is clicked
   */
  onButtonClick?: React.HTMLAttributes<HTMLButtonElement>['onClick'];
  /**
   * Callback when label is clicked
   */
  onClick?: React.HTMLAttributes<HTMLAnchorElement>['onClick'];
  /**
   * Indicate if the file is disabled
   */
  isDisabled?: boolean;
  /**
   * Indicate tag message
   */
  tagMessage?: string;
} & FileSGProps;

export const FileLabel = ({
  type,
  name,
  size,
  linkTo,
  linkState,
  errorMessage,
  isDisabled = false,
  icon = 'sgds-icon-arrow-right',
  iconColor,
  iconVariant,
  onButtonClick,
  onClick,
  className,
  tagMessage,
  ...rest
}: Props) => {
  return (
    <StyledContainer
      tabIndex={isDisabled ? -1 : 0}
      onClick={onClick}
      to={linkTo}
      state={linkState}
      $hasError={!!errorMessage}
      $isDisabled={isDisabled}
      className={className}
      data-testid={rest['data-testid'] ?? TEST_IDS.FILE_LABEL}
    >
      <StyledFileContainer>
        <StyledFileIconContainer $isDisabled={isDisabled}>
          <FileIcon type={type} variant={iconVariant} size="ICON_LARGE" />
        </StyledFileIconContainer>

        <StyledFileDetailsContainer $hasError={!!errorMessage} $isDisabled={isDisabled}>
          <StyledFileDetailsTextContainer data-testid={TEST_IDS.FILE_LABEL_DESCRIPITORS}>
            <StyledFileNameText variant="BODY">{name}</StyledFileNameText>

            <Typography variant="SMALL" color={Color.GREY60}>
              {size}
            </Typography>
          </StyledFileDetailsTextContainer>
          {!isDisabled && !tagMessage && (
            <StyledButtonContainer>
              {onButtonClick ? (
                <IconButton
                  decoration="GHOST"
                  icon={icon}
                  onClick={onButtonClick}
                  color={iconColor}
                  data-testid={TEST_IDS.FILE_LABEL_ICON}
                />
              ) : (
                <Icon icon={icon} size="ICON_SMALL" color={Color.PURPLE_DEFAULT} data-testid={TEST_IDS.FILE_LABEL_ICON} />
              )}
            </StyledButtonContainer>
          )}
          {tagMessage && (
            <Tag color="GREY" size={'MEDIUM'} data-testid={TEST_IDS.FILE_LABEL_TAG}>
              {tagMessage}
            </Tag>
          )}
        </StyledFileDetailsContainer>
      </StyledFileContainer>

      {errorMessage && (
        <StyledIconLabel
          title={
            <Typography variant="BODY" color={Color.RED_DEFAULT}>
              {errorMessage}
            </Typography>
          }
          icon="sgds-icon-circle-warning"
          iconColor={Color.RED_DEFAULT}
          iconSize="ICON_SMALL"
        />
      )}
    </StyledContainer>
  );
};
