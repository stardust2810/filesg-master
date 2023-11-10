import styled from 'styled-components';

export const StyledContainer = styled.div<{ $isCentered: boolean }>`
  display: flex;
  flex-direction: column;

  max-width: 640px;

  padding: ${({ theme }) => {
    const { S24, S80 } = theme.FSG_SPACING;
    return S24 + ' ' + S24 + ' ' + S80;
  }};

  gap: ${({ theme }) => theme.FSG_SPACING.S24};

  ${({ $isCentered }) => {
    if ($isCentered) {
      return `
      margin: 0 auto;
      align-items: center;
      `;
    }
    return '';
  }}

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => {
      const { S16, S24, S80 } = theme.FSG_SPACING;
      return S24 + ' ' + S16 + ' ' + S80;
    }};
  }
`;
