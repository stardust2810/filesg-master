import styled from 'styled-components';

export const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledLabelAndFieldContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S4};
`;

export const StyledInputRow = styled.div<{ hide?: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  justify-content: space-between;
  width: 100%;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    flex-direction: column;
  }
`;

export const StyledInputAndErrorContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;
