/* eslint-disable sonarjs/no-nested-template-literals */
import styled from 'styled-components';

import { ButtonColorsTheme } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { Typography } from '../../data-display/typography';
import { Props } from '.';

type StyledButtonProps = Pick<Props, 'color' | 'size'>;
type StyledItemContainerProps = Pick<Props, 'alignment' | 'fluid'>;

export const StyledContainer = styled.div<{ fluid: boolean }>`
  width: ${({ fluid }) => {
    if (fluid) {
      return 'max-content';
    }
    return '100%';
  }};
  max-width: 100%;
  position: relative;
`;

export const StyledButton = styled.button<StyledButtonProps & { expanded: boolean; color: ButtonColorsTheme }>`
  text-transform: none;
  display: flex;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  background-color: white;
  border-radius: 8px;
  height: ${({ theme }) => theme.FSG_SPACING.S48};

  border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};

  gap: ${({ theme }) => theme.FSG_SPACING.S12};

  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};

  padding: ${({ theme, size }) => {
    const { S6, S12, S16 } = theme.FSG_SPACING;
    if (size === 'SMALL') {
      return S6 + ' ' + S16;
    }
    return S12 + ' ' + S16;
  }};

  ${({ expanded, theme, color }) => expanded && 'border-color: ' + theme.FSG_COLOR[color].DEFAULT + ';'}

  &:hover {
    border-color: ${({ theme, color }) => theme.FSG_COLOR[color].LIGHT};
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
  }

  &:active {
    border-color: ${({ theme, color }) => theme.FSG_COLOR[color].DEFAULT};
  }
`;

export const StyledText = styled(Typography)<{ selectedOption: string | undefined }>`
  color: ${({ theme, selectedOption }) => (selectedOption ? theme.FSG_COLOR.GREYS.GREY80 : theme.FSG_COLOR.GREYS.GREY50)};
`;

export const StyledIconWrapper = styled.div<{ $rotate: boolean }>`
  transform: rotate(0deg);
  transition: all 0.3s ease-out;
  ${({ $rotate }) => $rotate && 'transform: rotate(180deg)'};
`;

export const StyledItemsContainer = styled.ul<StyledItemContainerProps>`
  width: ${({ fluid }) => {
    if (fluid) {
      return 'max-content';
    }
    return '100%;';
  }};

  /* ${({ alignment }) => {
    if (alignment === 'CENTER') {
      return 'left: 50%; transform: translate(-50%, 0);';
    }
    if (alignment === 'RIGHT') {
      return 'right: 0;';
    }
    return 'left: 0;';
  }} */

  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};

  /* margin-top: 0.375rem; */
  box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.1);
  /* z-index: 5; */
  /* overflow: hidden; */
  overflow: auto;
  animation: slideDown 300ms ease-out forwards;
  @keyframes slideDown {
    0% {
      max-height: 0;
    }
    100% {
      // this is the maximum height allowed for dropdown(regardless of screen height)
      max-height: 400px;
    }
  }
  &.slideUp {
    animation: slideUp 200ms ease-out forwards;
    @keyframes slideUp {
      0% {
        max-height: 400px;
      }
      100% {
        max-height: 0;
      }
    }
  }
`;

export const StyledIconTextContainer = styled.div`
  display: flex;
`;

export const StyledIcon = styled(Icon)`
  margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
`;
