import styled from 'styled-components';

import { Col } from '../../layout/col';
import { Container } from '../../layout/container';

export const StyledPublicPageHeader = styled.div`
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  border-bottom: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  padding: 0 ${({ theme }) => theme.FSG_SPACING.S48};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S24};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledContainer = styled(Container)`
  display: flex;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    flex-direction: column;
    gap: ${({ theme }) => theme.FSG_SPACING.S16};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    gap: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledPageDescriptorsContainer = styled(Col)<{ $hasImage: boolean }>`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  padding: ${({ theme }) => theme.FSG_SPACING.S40} 0;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP} - 1px)) {
    padding-right: ${({ theme }) => theme.FSG_SPACING.S80};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    padding-right: 0;

    ${({ $hasImage }) => {
      if ($hasImage) {
        return `padding-bottom: 0`;
      }
      return '';
    }};
  }
`;

export const StyledImageContainer = styled(Col)`
  display: flex;
  align-items: end;
  justify-content: end;
  flex: 1;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    justify-content: start;
  }
`;

export const StyledImg = styled.img`
  min-height: 164px;
`;
