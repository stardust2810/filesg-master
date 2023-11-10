import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S48};
`;

export const StyledTextContainer = styled.div`
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.FSG_SPACING.S32};

  & span {
    text-align: center;
  }
`;

export const StyledLabelContainer = styled.div`
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S12};
`;
