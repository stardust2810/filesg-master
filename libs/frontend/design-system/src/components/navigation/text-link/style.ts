import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { HEX_COLOR_OPACITY } from '../../../utils/constants';
import { Icon } from '../../data-display/icon';

const textLinkStyles = css<{ disabled: boolean }>`
  width: fit-content;
  color: ${({ theme, disabled }) => theme.FSG_COLOR.PRIMARY.DEFAULT + (disabled ? HEX_COLOR_OPACITY.P40 : '')};

  &:hover,
  &:active {
    ${({ theme, disabled }) => {
      if (!disabled) {
        return `color: ${theme.FSG_COLOR.PRIMARY.DARKER}`;
      }
      return `color: ${theme.FSG_COLOR.PRIMARY.DEFAULT + HEX_COLOR_OPACITY.P40}`;
    }}
  }

  &:focus-visible {
    outline-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT + HEX_COLOR_OPACITY.P25};
  }

  ${({ disabled }) => {
    if (disabled) {
      return css`
        cursor: default;
        pointer-events: none;
      `;
    }

    return '';
  }}
`;

export const StyledLink = styled(Link)<{ disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.FSG_SPACING.S4};

  ${textLinkStyles}
`;

export const StyledAnchor = styled.a<{ disabled: boolean }>`
  ${textLinkStyles}
`;

export const StyledAnchorLink = styled.span`
  word-break: break-all;
`;

export const StyledEndIcon = styled(Icon)`
  margin-left: ${({ theme }) => theme.FSG_SPACING.S4}; ;
`;
