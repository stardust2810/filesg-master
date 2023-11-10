import { Button, Color } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledBanner = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  gap: ${({ theme }) => theme.FSG_SPACING.S12};

  background: ${Color.GREY10};

  overflow: hidden;

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET})) and (max-width: calc(${({ theme }) =>
      theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    flex-direction: row;
    align-items: stretch;
    gap: ${({ theme }) => theme.FSG_SPACING.S32};
  }
`;

export const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  padding: ${({ theme }) => theme.FSG_SPACING.S16};
  padding-bottom: 0;
  gap: ${({ theme }) => theme.FSG_SPACING.S12};

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET})) and (max-width: calc(${({ theme }) =>
      theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding-right: 0;
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledImgContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET})) and (max-width: calc(${({ theme }) =>
      theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    align-items: flex-end;
  }
`;

export const StyledButton = styled(Button)`
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
`;
