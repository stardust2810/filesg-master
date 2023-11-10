import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  gap: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const InfoBoxInstructionsContaner = styled.div`
  display: flex;
  flex-direction: row;

  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  border: ${({ theme }) => `2px solid ${theme.FSG_COLOR.GREYS.GREY20}`};
`;

export const InfoBoxSettingIconContaner = styled.div`
  display: flex;
  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S24 + ' ' + S16;
  }};

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
`;

export const InfoBoxInstructionsTextContaner = styled.div`
  display: flex;

  padding: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledImage = styled.img`
  max-width: none;
`;
