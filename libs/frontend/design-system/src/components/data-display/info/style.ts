import styled from 'styled-components';

export const StyledContainer = styled.div<{ isCentered: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;

  gap: ${({ theme }) => theme.FSG_SPACING.S24};

  ${({ isCentered }) => {
    if (isCentered) {
      return `
      align-items: center;

      & > p, div > p {
        text-align: center;
      }
    `;
    }
  }}
`;

export const StyledImage = styled.img`
  height: 192px;
  object-fit: cover;

  border-radius: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledTitleTagContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S12};
`;
