import styled, { css } from 'styled-components';

export const StyledDynamicContent = styled.div`
  display: flex;
  flex-direction: column;
  > *:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;

export const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const listStyle = css`
  margin-left: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledOl = styled.ol`
  ${listStyle}
  li > ol {
    list-style-type: lower-alpha;
  }
`;

export const StyledUl = styled.ul`
  ${listStyle}
  list-style-type: disc;
`;
