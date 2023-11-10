import styled from 'styled-components';

export const StyledTextInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  flex: 1;

  > *:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;
