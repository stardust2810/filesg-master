import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;
