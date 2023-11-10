import styled from 'styled-components';

export const StyledLabel = styled.label`
  display: flex;
  > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;
