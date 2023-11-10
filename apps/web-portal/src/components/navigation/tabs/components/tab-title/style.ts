import { Color } from '@filesg/design-system';
import styled, { css } from 'styled-components';

interface Props {
  active: boolean;
  disabled: boolean;
}

const DISABLED_OPACITY = 0.4;

export const Button = styled.button<Props>`
  cursor: pointer;
  border: none;
  padding: ${({ theme }) => {
    const { S12, S16 } = theme.FSG_SPACING;
    return S12 + ' ' + S16;
  }};
  background-color: inherit;

  /* DISABLED */
  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
      opacity: ${DISABLED_OPACITY};
    `}

  /* HOVER */
  &:hover {
    color: inherit;
    background-color: ${Color.GREY20};
  }

  /* ACTIVE */
  ${({ active }) =>
    active &&
    css`
      color: inherit;
      &:hover {
        /* box-shadow: inset 0 -3px 0 0 ${Color.PURPLE_DEFAULT}; */
      }
    `}
`;
