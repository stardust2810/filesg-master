import styled from 'styled-components';

import { Typography } from '../../data-display/typography';
import { Props } from './index';
type StyledProps = Pick<Props, 'disabled' | 'status'>;

const getBorderColor = ({ theme, status }: any) => {
  if (status === 'success') {
    return '1px solid ' + theme.FSG_COLOR.SUCCESS.DEFAULT;
  }
  if (status === 'invalid') {
    return '1px solid ' + theme.FSG_COLOR.DANGER.DEFAULT;
  }
  return '1px solid ' + theme.FSG_COLOR.DEFAULT.LIGHTER;
};

export const StyledField = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100%;

  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;

export const StyledDateInputWrapper = styled.div`
  display: flex;
  flex-direction: row;

  > *:not(:last-child) {
    margin-right: 12px;
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
`;

export const StyledDateInput = styled.div`
  display: flex;
  flex-direction: column;

  small {
    color: ${({ theme }) => {
      return theme.FSG_COLOR.DEFAULT.LIGHT;
    }};
    font-size: ${({ theme }) => {
      return theme.FSG_FONT.H6.SIZE;
    }};
    line-height: ${({ theme }) => {
      return theme.FSG_FONT.H6.LINE_HEIGHT;
    }};
    width: 100%;
    text-align: center;
  }
`;

export const StyledDayMonthInput = styled.input<StyledProps>`
  font-family: ${({ theme }) => {
    return theme.FSG_FONT.H5.FONT_FAMILY;
  }};
  font-style: normal;
  font-weight: 400;
  font-size: ${({ theme }) => {
    return theme.FSG_FONT.H5.SIZE;
  }};
  line-height: ${({ theme }) => {
    return theme.FSG_FONT.H5.LINE_HEIGHT;
  }};

  width: 44px;
  height: 48px;
  padding: ${({ theme }) => {
    return theme.FSG_SPACING.S12;
  }};
  border-radius: 8px;
  border: ${getBorderColor};

  &.default-datepicker {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.DEFAULT.LIGHTER;
    }};
  }

  &.invalid-datepicker {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.DANGER.DEFAULT;
    }};
  }

  &.success-datepicker {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.SUCCESS.DEFAULT;
    }};
  }

  &:hover {
    border: ${({ theme }) => '1px solid ' + theme.FSG_COLOR.GREYS.GREY60};
  }

  &:focus {
    border: none;
    outline: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.PRIMARY.DEFAULT;
    }};
  }

  &:disabled {
    border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY50};
  }
`;

export const StyledYearInput = styled.input<StyledProps>`
  font-family: ${({ theme }) => {
    return theme.FSG_FONT.H5.FONT_FAMILY;
  }};
  font-style: normal;
  font-weight: 400;
  font-size: ${({ theme }) => {
    return theme.FSG_FONT.H5.SIZE;
  }};
  line-height: ${({ theme }) => {
    return theme.FSG_FONT.H5.LINE_HEIGHT;
  }};

  width: 64px;
  height: 48px;
  padding: ${({ theme }) => {
    return theme.FSG_SPACING.S12;
  }};
  border-radius: 8px;
  border: ${getBorderColor};

  &.default-datepicker {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.DEFAULT.LIGHTER;
    }};
  }

  &.invalid-datepicker {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.DANGER.DEFAULT;
    }};
  }

  &.success-datepicker {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.SUCCESS.DEFAULT;
    }};
  }

  &:hover {
    border: ${({ theme }) => '1px solid ' + theme.FSG_COLOR.GREYS.GREY60};
  }

  &:focus {
    border: none;
    outline: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.PRIMARY.DEFAULT;
    }};
  }

  &:disabled {
    border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY50};
  }
`;

export const StyledFieldHelpText = styled(Typography)`
  text-align: center;
`;
