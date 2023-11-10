import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  gap: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledUnorderedList = styled.ul`
  list-style-type: disc;
  margin-left: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledList = styled.li`
  line-height: normal;
`;

export const StyledBreak = styled.div`
  height: ${({ theme }) => theme.FSG_SPACING.S16};
`;
