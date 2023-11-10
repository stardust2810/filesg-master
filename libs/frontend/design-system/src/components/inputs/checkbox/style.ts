/* eslint-disable sonarjs/no-nested-template-literals */
import styled from 'styled-components';

import { Typography } from '../../data-display/typography';
import { Props } from '.';

type StyledProps = Pick<Props, 'color' | 'frame' | 'disabled' | 'className'>;

export const StyledLabel = styled.label<StyledProps>`
  display: flex;
  position: relative;
  min-width: 32px;
  border-radius: 8px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ disabled, frame, color }) => {
    if (!disabled) {
      return `
        &:hover ${!frame ? '> span:nth-child(2)' : ''}{
          border: 1px solid ${color};
        }
      `;
    }
    return '';
  }}

  ${({ frame, color, theme }) => {
    const { S8, S12 } = theme.FSG_SPACING;
    if (frame) {
      return `
        border: 1px solid ${theme.FSG_COLOR.GREYS.GREY30};
        padding: ${S8} ${S12};

        &:focus-within {
          box-shadow: 0px 0px 0px 2px ${color}40;
        }
      `;
    }
    return '';
  }}

  ${({ disabled, frame, theme }) => {
    if (disabled && frame) {
      return `
        background-color: ${theme.FSG_COLOR.GREYS.GREY20};
        cursor: auto;
      `;
    }
    return '';
  }}
`;

export const StyledInput = styled.input<{ frame?: boolean }>`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;

  & ~ span:nth-child(2) {
    background-color: ${({ disabled, theme }) => disabled && theme.FSG_COLOR.GREYS.GREY20};
  }

  &:checked ~ span:nth-child(2) {
    background-color: ${({ color }) => color};
    border: 1px solid ${({ color }) => color};
  }

  &:checked ~ span:nth-child(2) > * {
    display: flex;
  }

  ${({ frame, color }) => {
    if (!frame) {
      return `
        &:focus ~ span:nth-child(2) {
          box-shadow: 0px 0px 0px 2px ${color}40;
        }
      `;
    }
    return '';
  }}
`;

export const StyledCheckbox = styled.span`
  position: relative;
  min-height: 24px;
  height: 24px;
  min-width: 24px;
  width: 24px;
  border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  border-radius: 4px;
  margin: ${({ theme }) => theme.FSG_SPACING.S4};
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  & > span {
    position: relative;
    display: none;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  }
`;

export const StyledText = styled(Typography)<{ disabled?: boolean }>`
  position: relative;
  width: fit-content;
  padding: ${({ theme }) => {
    const { S4, S8 } = theme.FSG_SPACING;
    return S4 + ' ' + S8;
  }};

  ${({ disabled, theme }) => disabled && 'color: ' + theme.FSG_COLOR.GREYS.GREY50 + ';'}
`;
