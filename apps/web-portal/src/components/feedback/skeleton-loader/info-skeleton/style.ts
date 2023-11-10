import styled from 'styled-components';

export const StyledInfoItemSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledInfoSkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledInfoItemSkeletonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S24};
`;
