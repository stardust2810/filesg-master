import React, { ForwardedRef, forwardRef, MutableRefObject, RefObject } from 'react';
import { useTheme } from 'styled-components';

import { Color } from '../../../styles/color';
import { FIELD_ERROR_IDS, TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { IconLabel } from '../../data-display/icon-label';
import { Typography } from '../../data-display/typography';
import { StyledDateInput, StyledDateInputWrapper, StyledDayMonthInput, StyledField, StyledFieldHelpText, StyledYearInput } from './style';

export interface DateValue {
  day: string;
  month: string;
  year: string;
}
interface DatePickerRefs {
  dayRef: RefObject<HTMLInputElement>;
  monthRef: RefObject<HTMLInputElement>;
  yearRef: RefObject<HTMLInputElement>;
}

export enum DatePickerStatus {
  DEFAULT = 'default',
  SUCCESS = 'success',
  INVALID = 'invalid',
}

export type Props = {
  onDateChange: (date: DateValue) => void;
  onBlur?: () => void;
  date: DateValue;
  disabled: boolean;
  status?: DatePickerStatus;
  errorMessage?: string;
  errorElementId?: string;
} & FileSGProps;

const maxLength = {
  day: 2,
  month: 2,
  year: 4,
};

type Event = React.ChangeEvent<HTMLInputElement>;
type UpdateDate = (e: Event) => void;

export const DatePicker = forwardRef(
  (
    { onDateChange, onBlur, date, disabled, status = DatePickerStatus.DEFAULT, errorMessage, errorElementId, ...rest }: Props,
    ref: ForwardedRef<DatePickerRefs>,
  ) => {
    const { dayRef, monthRef, yearRef } = (ref as MutableRefObject<DatePickerRefs>).current;
    const theme = useTheme();
    const updateDate =
      (type: 'day' | 'month' | 'year'): UpdateDate =>
      (e: Event): void => {
        const { value } = e.target;
        const numberOnly = new RegExp(/^\d+$/);
        const dateInput = value.slice(0, maxLength[type]);

        if (value && !numberOnly.test(dateInput)) {
          return onDateChange({ ...date }); // return last known correct date format
        }
        onDateChange({ ...date, [type]: dateInput });

        const isAtEndOfInput = dateInput.length === maxLength[type];

        if (type === 'day' && isAtEndOfInput) {
          monthRef.current!.focus();
          monthRef.current!.selectionStart = 0;
          monthRef.current!.selectionEnd = date.month.length;
        } else if (type === 'month' && isAtEndOfInput) {
          yearRef.current!.focus();
          yearRef.current!.selectionStart = 0;
          yearRef.current!.selectionEnd = date.year.length;
        }
      };

    const onKeyDownDay = (e: React.KeyboardEvent<HTMLInputElement>): void => {
      const cursorStart = dayRef.current!.selectionStart;
      const cursorEnd = dayRef.current!.selectionEnd;

      // right arrow at back of input
      if (e.code === 'ArrowRight' && cursorStart === date.day.length && cursorEnd === date.day.length) {
        e.preventDefault();
        monthRef.current!.focus();
        monthRef.current!.selectionStart = 0;
        monthRef.current!.selectionEnd = 0;
      }
    };

    const onKeyDownMonth = (e: React.KeyboardEvent<HTMLInputElement>): void => {
      const cursorStart = monthRef.current!.selectionStart;
      const cursorEnd = monthRef.current!.selectionEnd;

      // backspace at front of input
      if (e.code === 'Backspace' && cursorStart === 0 && cursorEnd === 0) {
        dayRef.current!.focus();
        dayRef.current!.selectionStart = date.day.length;
        dayRef.current!.selectionEnd = date.day.length;
      }

      // left arrow at front of input
      if (e.code === 'ArrowLeft' && cursorStart === 0 && cursorEnd === 0) {
        e.preventDefault();
        dayRef.current!.focus();
        dayRef.current!.selectionStart = date.day.length;
        dayRef.current!.selectionEnd = date.day.length;
      }

      // right arrow at back of input
      if (e.code === 'ArrowRight' && cursorStart === date.month.length && cursorEnd === date.month.length) {
        e.preventDefault();
        yearRef.current!.focus();

        yearRef.current!.selectionStart = 0;
        yearRef.current!.selectionEnd = 0;
      }
    };

    const onKeyDownYear = (e: React.KeyboardEvent<HTMLInputElement>): void => {
      const cursorStart = yearRef.current!.selectionStart;
      const cursorEnd = yearRef.current!.selectionEnd;

      // backspace at front of input
      if (e.code === 'Backspace' && cursorStart === 0 && cursorEnd === 0) {
        monthRef.current!.focus();
        monthRef.current!.selectionStart = date.month.length;
        monthRef.current!.selectionEnd = date.month.length;
      }

      // left arrow at front of input
      if (e.code === 'ArrowLeft' && cursorStart === 0 && cursorEnd === 0) {
        e.preventDefault();
        monthRef.current!.focus();
        monthRef.current!.selectionStart = date.month.length;
        monthRef.current!.selectionEnd = date.month.length;
      }
    };

    return (
      <StyledField data-testid={rest['data-testid'] ?? TEST_IDS.DATEPICKER}>
        <StyledDateInputWrapper>
          <StyledDateInput>
            <StyledDayMonthInput
              ref={dayRef}
              inputMode={'numeric'}
              type="text"
              autoComplete="off"
              disabled={disabled}
              value={date.day}
              maxLength={2}
              onChange={updateDate('day')}
              onBlur={onBlur}
              onInput={updateDate('day')}
              onKeyDown={onKeyDownDay}
              data-testid={TEST_IDS.DATEPICKER_DAY}
              status={status}
              aria-invalid={!!errorMessage}
            />
            <StyledFieldHelpText variant="SMALL" color={theme.FSG_COLOR.GREYS.GREY60} aria-hidden={true}>
              DD
            </StyledFieldHelpText>
          </StyledDateInput>
          <StyledDateInput>
            <StyledDayMonthInput
              ref={monthRef}
              inputMode={'numeric'}
              type="text"
              autoComplete="off"
              disabled={disabled}
              value={date.month}
              maxLength={2}
              onChange={updateDate('month')}
              onInput={updateDate('month')}
              onBlur={onBlur}
              onKeyDown={onKeyDownMonth}
              data-testid={TEST_IDS.DATEPICKER_MONTH}
              status={status}
              aria-invalid={!!errorMessage}
            />
            <StyledFieldHelpText variant="SMALL" color={theme.FSG_COLOR.GREYS.GREY60} aria-hidden={true}>
              MM
            </StyledFieldHelpText>
          </StyledDateInput>
          <StyledDateInput>
            <StyledYearInput
              ref={yearRef}
              inputMode={'numeric'}
              type="text"
              autoComplete="off"
              disabled={disabled}
              value={date.year}
              maxLength={4}
              onChange={updateDate('year')}
              onInput={updateDate('year')}
              onBlur={onBlur}
              onKeyDown={onKeyDownYear}
              data-testid={TEST_IDS.DATEPICKER_YEAR}
              status={status}
              aria-invalid={!!errorMessage}
            />
            <StyledFieldHelpText variant="SMALL" color={theme.FSG_COLOR.GREYS.GREY60} aria-hidden={true}>
              YYYY
            </StyledFieldHelpText>
          </StyledDateInput>
        </StyledDateInputWrapper>
        {errorMessage && (
          <IconLabel
            role="alert"
            id={errorElementId ?? FIELD_ERROR_IDS.DATEPICKER_FIELD_ERROR}
            icon="sgds-icon-circle-warning"
            iconSize="ICON_SMALL"
            iconColor={Color.RED_DEFAULT}
            alignment="CENTER"
            description={
              <Typography variant="BODY" color={Color.RED_DEFAULT}>
                {errorMessage}
              </Typography>
            }
            gap="0.5rem"
            data-testid={TEST_IDS.DATEPICKER_ERROR}
          />
        )}
      </StyledField>
    );
  },
);
