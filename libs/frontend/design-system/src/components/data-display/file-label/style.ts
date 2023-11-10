import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Color } from '../../../styles/color';
import { IconLabel } from '../icon-label';
import { Typography } from '../typography';
const DISABLED_OPACITY = 0.4;
type StyledStylingProps = {
  // hasError is true when there is an errorMessage passed in
  $hasError?: boolean;
  $isDisabled?: boolean;
};

export const StyledContainer = styled(Link)<StyledStylingProps>`
  color: inherit;
  display: block;
  margin: 0;
  background-color: ${({ $hasError, theme }) => {
    if ($hasError) {
      return theme.FSG_COLOR.DANGER.LIGHTEST;
    }
    return '';
  }};

  &:hover {
    background-color: ${({ $hasError }) => {
      if (!$hasError) {
        return Color.GREY10;
      }
      return '';
    }};

    color: inherit;
  }
  pointer-events: ${({ $isDisabled }) => {
    if ($isDisabled) {
      return 'none';
    }
    return '';
  }};
`;

export const StyledFileContainer = styled.span`
  display: flex;
  align-items: center;
`;

export const StyledFileDetailsContainer = styled.span<StyledStylingProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;

  padding: ${({ theme }) => {
      return theme.FSG_SPACING.S12;
    }}
    0;

  > * {
    opacity: ${({ $isDisabled }) => {
      if ($isDisabled) {
        return DISABLED_OPACITY;
      }
      return '1';
    }};
  }

  border-bottom: 1px solid
    ${({ $hasError, theme }) => {
      if ($hasError) {
        return theme.FSG_COLOR.DANGER.DEFAULT;
      }
      return theme.FSG_COLOR.GREYS.GREY30;
    }};

  &:hover {
    border-bottom: 1px solid
      ${({ $hasError, theme }) => {
        if ($hasError) {
          return theme.FSG_COLOR.DANGER.DEFAULT;
        }
        return 'auto';
      }};
  }
`;

export const StyledFileDetailsTextContainer = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: ${({ theme }) => {
    return theme.FSG_SPACING.S4;
  }};
`;

export const StyledFileNameText = styled(Typography)`
  white-space: initial;
`;

export const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    display: none;
  }
`;

export const StyledIconLabel = styled(IconLabel)`
  margin-right: ${({ theme }) => {
    return theme.FSG_SPACING.S8;
  }};
`;

export const StyledFileIconContainer = styled.div<StyledStylingProps>`
  height: 72px;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    opacity: ${({ $isDisabled }) => {
      if ($isDisabled) {
        return DISABLED_OPACITY;
      }
      return '1';
    }};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    height: 70px;
    width: 48px;
  }
`;
