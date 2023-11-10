import styled from 'styled-components';

export const StyledOaInfoCard = styled.div`
  display: flex;
  > :not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S32};
  }
  align-items: center;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    flex-direction: column;
    align-items: initial;

    > :not(:last-child) {
      margin-right: 0;
      margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }
`;

export const StyledOaInfoDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledOaInfoImgWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S16};
  padding: ${({ theme }) => {
    const { S8, S16 } = theme.FSG_SPACING;
    return `${S8} ${S16}`;
  }};
`;
