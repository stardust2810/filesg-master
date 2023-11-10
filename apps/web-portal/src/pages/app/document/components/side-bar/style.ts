import styled from "styled-components";

export const StyledHeaderContainer = styled.div`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledMoreActionsContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  padding: ${({ theme }) => theme.FSG_SPACING.S24};

  border-bottom: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
`;

export const StyledFileDetailsContainer = styled.div`
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
`;
