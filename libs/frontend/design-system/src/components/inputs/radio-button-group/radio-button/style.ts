import styled, { css } from 'styled-components';

import { Color } from '../../../../styles/color';
import { Variant } from '.';

export const StyledRadioButton = styled.label<{ $variant: Variant }>`
  display: flex;
  align-items: flex-start;
  flex: 1;

  word-break: break-word;

  ${({ $variant }) => {
    if ($variant === 'WITH_FRAME') {
      return css`
        border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
        padding: ${({ theme }) => {
          const { S8, S12 } = theme.FSG_SPACING;

          return `${S8} ${S12}`;
        }};
        border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
        background: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

        :has(input[type='radio']:checked) {
          border-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
        }
      `;
    }
  }}

  input[type='radio'] {
    // NOTE: accent-color is not fully supported, browsers only started support in 2021
    // ref: https://bryntum.com/blog/3-ways-to-style-radio-buttons-with-modern-css/
    // accent-color: #372cd1;

    /* The native appearance is hidden */
    appearance: none;
    -webkit-appearance: none;

    /* For a circular appearance we need a border-radius. */
    border-radius: 50%;

    /* The background will be the radio dot's color. */
    background: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

    /* The border will be the spacing between the dot and the outer circle */
    border: ${({ theme }) => theme.FSG_SPACING.S6} solid ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

    /* And by creating a box-shadow with no offset and no blur, we have an outer circle */
    box-shadow: 0 0 0 1px ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};

    width: ${({ theme }) => theme.FSG_SPACING.S24};
    height: ${({ theme }) => theme.FSG_SPACING.S24};
    // To prevent radio button from changing width when screen size is small
    min-width: ${({ theme }) => theme.FSG_SPACING.S24};
    min-height: ${({ theme }) => theme.FSG_SPACING.S24};

    margin: ${({ theme }) => theme.FSG_SPACING.S4};
  }

  input[type='radio']:checked {
    /* The background will be the radio dot's color. */
    background: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};

    /* And by creating a box-shadow with no offset and no blur, we have an outer circle */
    box-shadow: 0 0 0 1px ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
  }

  ${({ $variant }) => {
    if ($variant === 'WITH_FRAME') {
      return css`
        :has(input[type='radio']:hover:not([disabled])) {
          border-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
        }

        :has(input[type='radio']:focus) {
          outline: solid 2px ${Color.FOCUS_RING_PRIMARY};
          outline-offset: 0;
        }
      `;
    } else {
      return css`
        input[type='radio']:hover:not([disabled]) {
          /* And by creating a box-shadow with no offset and no blur, we have an outer circle */
          box-shadow: 0 0 0 1px ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
        }

        input[type='radio']:focus {
          outline: solid 2px ${Color.FOCUS_RING_PRIMARY};
          outline-offset: 0;
        }
      `;
    }
  }}

  /* DISABLED */
  input[type='radio']:disabled {
    /* The background will be the radio dot's color. */
    background: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};

    /* And by creating a box-shadow with no offset and no blur, we have an outer circle */
    box-shadow: 0 0 0 1px ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};

    border: none;
  }

  :has(input[type='radio']:disabled) {
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY50};
  }

  ${({ $variant }) => {
    if ($variant === 'WITH_FRAME') {
      return css`
        :has(input[type='radio']:disabled) {
          background: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
        }
      `;
    }
  }}
`;

export const StyledLabelContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding: ${({ theme }) => {
    const { S8, S4 } = theme.FSG_SPACING;

    return `${S4} ${S8}`;
  }};
`;
