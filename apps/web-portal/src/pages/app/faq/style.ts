import { Col } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const StyledActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;

  padding: ${({ theme }) => {
    const { S8, S16 } = theme.FSG_SPACING;
    return S8 + ' ' + 0 + ' ' + S16 + ' ' + 0;
  }};
`;

export const StyledSideNavMenu = styled.div`
  position: sticky;
  top: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledSideNavMenuTitleWrapper = styled.div`
  padding-left: ${({ theme }) => theme.FSG_SPACING.S24};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledContactUsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};

  margin-top: ${({ theme }) => theme.FSG_SPACING.S40};
`;

export const StyledColumn = styled(Col)`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S32};
`;
