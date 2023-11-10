import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { IconButton } from '../../../../inputs/icon-button';

const listItemStyles = css<{ $isNested?: boolean }>`
  display: flex;
  align-items: center;
  height: ${({ $isNested }) => ($isNested ? '2.25rem' : '2.5rem')};
  padding: ${({ theme }) => 0 + ' ' + theme.FSG_SPACING.S24};
  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  div,
  p,
  span {
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};
    font-family: 'Work Sans';
    font-size: ${({ $isNested }) => ($isNested ? '0.875rem' : '1rem')};
    font-weight: 500;
  }

  &.active {
    .list-item-cta-label {
      p,
      span {
        font-weight: 600;
        color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
      }
    }
  }

  &:hover {
    ${({ $isNested }) => {
      if ($isNested) {
        return css`
          background-color: inherit;
          color: inherit;

          .list-item-cta-label {
            font-weight: 600;
          }
        `;
      } else {
        return css`
          color: inherit;
          background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
        `;
      }
    }}
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP}) {
    padding-left: ${({ theme }) => theme.FSG_SPACING.S48};
  }
`;

export const StyledListActionButton = styled.button`
  ${listItemStyles}

  cursor: pointer;
  border: none;
  width: 100%;

  justify-content: flex-start;
  min-height: inherit;

  background-color: inherit;

  div {
    align-items: center;
  }
`;

export const StyledListNavLink = styled(NavLink)`
  ${listItemStyles}

  /* Box shadow used instead of outline as this component might
  *  contain another button (button nested in link)
  */
  :focus {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTER};
    outline: none;
  }
`;

export const StyledTextWrapper = styled.div<{ iconAtLeft?: boolean }>`
  flex: 1;
  text-align: left;
`;

export const StyledIconButton = styled(IconButton)`
  background-color: inherit;
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};
  z-index: 300;

  &:focus {
    background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  }
  &:hover {
    background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
    outline: none !important;
  }
`;
