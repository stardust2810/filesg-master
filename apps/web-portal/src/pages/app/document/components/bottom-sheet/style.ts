import styled from 'styled-components';

export const StyledFileDetailsContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledMoreActionsContainer = styled.div``;

export const StyledMoreActionsButton = styled.button`
  display: flex;
  width: 100%;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  padding: ${({ theme }) => theme.FSG_SPACING.S16};

  border: none;
  border-bottom: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};

  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.FSG_COLOR.GREYS.GREY20};
  }

  ${({ theme, disabled }) => {
    if (disabled) {
      return `color: ${theme.FSG_COLOR.GREYS.GREY30}; !important`;
    }
  }};
`;

export const StyledOAButtonContainer = styled.div`
  display: flex;

  padding: ${({ theme }) => theme.FSG_SPACING.S16};
`;
