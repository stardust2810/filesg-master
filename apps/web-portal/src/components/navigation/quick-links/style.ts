import styled from 'styled-components';

export const StyledRelatedPagesContainer = styled.div`
  position: sticky;
  top: 0;

  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S8};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledRelatedPagesHeaderContainer = styled.div`
  display: flex;

  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S16 + ' ' + S24;
  }};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16 + ' 0'};
  }
`;

export const StyledRelatedPagesLinksContainer = styled.ul`
  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S24};
  padding: ${({ theme }) => '0 ' + theme.FSG_SPACING.S24};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding: 0;
  }
`;
