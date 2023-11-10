import { Color } from '@filesg/design-system';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { Props } from '.';

type ChipStylingProps = Pick<Props, 'disabled'>;
const DISABLED_OPACITY = 0.4;

export const StyledLink = styled(Link)<ChipStylingProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  height: 2rem;
  width: fit-content;
  max-width: 224px; // including border

  border: 1px solid ${Color.GREY30};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S16};

  padding: ${({ theme }) => {
    const { S12 } = theme.FSG_SPACING;
    return 0 + ' ' + S12;
  }};

  /* Disabled */
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: ${DISABLED_OPACITY};
      pointer-events: none;
    `}

  /* Hover */
  &:hover {
    background-color: ${Color.GREY20};
    border-color: ${Color.GREY60};
  }
`;

export const StyleFileLabel = styled.span`
  display: flex;
  p {
    // NOTE: this is using a special fallback font to prevent 2 lines of files shown in activity card
    font-family: Noto Sans, Geneva, Verdana;
  }
`;
