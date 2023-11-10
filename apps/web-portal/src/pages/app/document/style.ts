import styled from 'styled-components';

import { RIGHT_SIDEBAR_WIDTH } from '../../../consts';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;
  min-height: 0;
  width: 100%;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
`;

export const StyledNavigationWrapper = styled.div`
  width: 100%;

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
`;

export const StyledBodyContainer = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
  flex: 1 0 0;
  min-height: 0;
`;

export const StyledSidebarContainer = styled.div`
  display: flex;
  flex-direction: column;

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  overflow: auto;

  width: ${RIGHT_SIDEBAR_WIDTH / 16}rem;
  min-width: ${RIGHT_SIDEBAR_WIDTH / 16}rem;
  border-left: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};
`;

export const StyledMoreActionsButton = styled.button`
  display: flex;
  width: 100%;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  padding: ${({ theme }) => theme.FSG_SPACING.S16};

  border: none;
  border-bottom: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};

  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.FSG_COLOR.GREYS.GREY20};
  }

  ${({ theme, disabled }) => {
    if (disabled) {
      return `color: ${theme.FSG_COLOR.GREYS.GREY30}; !important`;
    }
  }};
`;
