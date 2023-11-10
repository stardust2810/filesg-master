import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  justify-content: center;

  width: 100%;

  padding: ${({ theme }) => {
    const { S16, S80 } = theme.FSG_SPACING;
    return S16 + ' 0 ' + S80;
  }};

  @media screen and (min-width: 600px) and (max-width: 1023px) {
    padding: ${({ theme }) => {
      const { S8, S72 } = theme.FSG_SPACING;
      return S8 + ' 0 ' + S72;
    }};
  }

  @media screen and (max-width: 599px) {
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S64};
  }
`;

export const LinksContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;
