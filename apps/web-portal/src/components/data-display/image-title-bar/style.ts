import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;

  width: 100%;
`;

export const StyledImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};
  padding: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledTitleContainer = styled.div`
  display: flex;
  width: 100%;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};

  padding: ${({ theme }) => {
    const { S8, S16 } = theme.FSG_SPACING;

    return `${S8} ${S16}`;
  }};
`;
