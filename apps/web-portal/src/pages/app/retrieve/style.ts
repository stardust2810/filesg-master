import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const StyledHeader = styled.div`
  margin: ${({ theme }) => theme.FSG_SPACING.S16} 0;
`;

export const StyledForm = styled.form`
  display: flex;

  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S48};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    flex-direction: column;
    > * input {
      min-height: 72px;

      ::placeholder {
        white-space: pre-line;
        position: relative;
        top: -10px;
      }
    }
  }
`;

export const StyledFaqContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
`;
