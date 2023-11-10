import styled from 'styled-components';

export const StyledDetailContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledDetailsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;
