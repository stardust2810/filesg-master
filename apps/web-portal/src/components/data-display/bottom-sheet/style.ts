import { HEX_COLOR_OPACITY } from '@filesg/design-system';
import { animated } from '@react-spring/web';
import styled from 'styled-components';

import { MOBILE_BOTTOM_SHEET_TAB_HEIGHT, TABLET_BOTTOM_SHEET_TAB_HEIGHT } from '../../../consts';

type ExpandedProps = {
  isExpanded: boolean;
};

type SelectedProps = {
  isSelected: boolean;
};

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;

  max-height: 80vh;
  width: 100%;

  z-index: 41;
`;

export const StyledTabsContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const StyledTab = styled.button<ExpandedProps & SelectedProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border: none;

  height: ${TABLET_BOTTOM_SHEET_TAB_HEIGHT / 16}rem;

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  border-top: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};
  border-bottom: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};

  &:focus {
    position: relative;
  }

  &:not(:last-of-type) {
    border-right: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};
  }

  ${({ isSelected, theme }) => {
    if (isSelected) {
      return `
      background-color: ${theme.FSG_COLOR.GREYS.GREY10};
      `;
    }
  }};

  ${({ isExpanded, theme }) => {
    if (isExpanded) {
      return `
      border: 1px solid ${theme.FSG_COLOR.GREYS.GREY30};

      &:first-of-type {
          border-top-left-radius: ${theme.FSG_SPACING.S8};
        }

        &:last-of-type {
          border-top-right-radius: ${theme.FSG_SPACING.S8};
        }

        &:not(:last-of-type) {
          border-right: none;
        }
    `;
    }
  }}

  @media screen and (max-width: 599px) {
    height: ${MOBILE_BOTTOM_SHEET_TAB_HEIGHT / 16}rem;
  }
`;

export const StyledBodyContainer = styled(animated.div)`
  overflow-y: auto;

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  border: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};
  border-top: none;
`;

export const StyledModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80 + HEX_COLOR_OPACITY.P60};

  width: 100%;
  height: 100%;

  z-index: 40;
`;
