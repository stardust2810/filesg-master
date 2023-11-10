import { forwardRef, HTMLInputTypeAttribute, InputHTMLAttributes } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { Color } from '../../../styles/color';
import { FIELD_ERROR_IDS, TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { IconLabel } from '../../data-display/icon-label';
import { Typography } from '../../data-display/typography';
import { Button } from '../button';
import { StyledContainer, StyledInput, StyledInputAndButtonContainer } from './style';

export type Props = {
  fieldId?: string;
  type?: Extract<HTMLInputTypeAttribute, 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url'>;
  errorMessage?: string;
  errorElementId?: string;
  successMessage?: string;
  autoComplete?: 'on' | 'off';
  autoFocus?: boolean;
  value?: InputHTMLAttributes<HTMLInputElement>['value'];
  defaultValue?: string | number;
  formNoValidate?: boolean;
  placeholder?: string;
  hasSubmitButton?: boolean;
  submitButtonLabel?: string;
  isSubmitButtonLoading?: boolean;
} & Partial<Omit<UseFormRegisterReturn, 'ref'>> &
  FileSGProps;

export const TextInputField = forwardRef<HTMLInputElement, Props>(
  (
    {
      fieldId,
      errorMessage,
      successMessage,
      hasSubmitButton = false,
      autoComplete = 'off',
      submitButtonLabel = 'Submit',
      isSubmitButtonLoading,
      errorElementId,
      ...rest
    },
    ref,
  ) => {
    return (
      <StyledContainer data-testid={rest['data-testid'] ?? TEST_IDS.TEXT_INPUT_CONTAINER}>
        <StyledInputAndButtonContainer>
          <StyledInput
            id={fieldId}
            ref={ref}
            error={!!errorMessage}
            aria-invalid={!!errorMessage}
            success={!!successMessage}
            {...rest}
            autoComplete={autoComplete}
            data-testid={TEST_IDS.TEXT_INPUT}
          />
          {hasSubmitButton && (
            <Button
              type="submit"
              data-testid={(rest['data-testid'] ?? TEST_IDS.TEXT_INPUT_CONTAINER) + '-submit-btn'}
              label={submitButtonLabel}
              isLoading={isSubmitButtonLoading}
            />
          )}
        </StyledInputAndButtonContainer>
        {errorMessage && (
          <IconLabel
            role="alert"
            iconSize="ICON_SMALL"
            icon="sgds-icon-circle-warning"
            iconColor={Color.RED_DEFAULT}
            gap="0.5rem"
            alignment="CENTER"
            description={
              <Typography variant="BODY" color={Color.RED_DEFAULT}>
                {errorMessage}
              </Typography>
            }
            data-testid={TEST_IDS.TEXT_INPUT_ERROR_PROMPT}
            id={errorElementId ?? FIELD_ERROR_IDS.TEST_FIELD_ERROR}
          />
        )}
        {successMessage && (
          <IconLabel
            iconSize="ICON_SMALL"
            icon="fsg-icon-circle-check"
            iconColor={Color.GREEN_DEFAULT}
            gap="0.5rem"
            alignment="CENTER"
            description={
              <Typography variant="BODY" color={Color.GREEN_DEFAULT}>
                {successMessage}
              </Typography>
            }
            data-testid={TEST_IDS.TEXT_INPUT_SUCCESS_PROMPT}
          />
        )}
      </StyledContainer>
    );
  },
);
