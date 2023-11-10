/* eslint-disable sonarjs/no-nested-template-literals */
import styled from 'styled-components';

export const StyledNav = styled.nav``;

export const StyledList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  list-style-type: none;
  align-items: center;
  max-width: 100%;
`;

export const StyledListItem = styled.li<{
  maxWidth: number;
  ellipsis: boolean;
}>`
  ${({ ellipsis }) =>
    ellipsis &&
    `
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  `}

  max-width: ${({ maxWidth }) => {
    return `${maxWidth / 16}rem`;
  }};
`;

export const StyledSeparator = styled.li`
  margin: auto ${({ theme }) => theme.FSG_SPACING.S8};

  user-select: none;

  &:first-child {
    margin-left: 0;
  }
`;

// For storybook
export const StyledNavLink = styled.a`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.FSG_FONT.H6.SIZE};
  font-family: ${({ theme }) => theme.FSG_FONT.H6.FONT_FAMILY};
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};

  &:hover {
    color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
    text-decoration: underline;
  }
`;

export const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0 4px;
`;
