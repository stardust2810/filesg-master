import styled from 'styled-components';

export const StyledPageDescriptorContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S24 } = theme.FSG_SPACING;
      return S24 + ' ' + S16;
    }};
  }
`;
