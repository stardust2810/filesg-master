import { forwardRef, InputHTMLAttributes } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { useTheme } from 'styled-components';

import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { ErrorIconLabel } from '../../data-display/error-icon-label';
import { Typography } from '../../data-display/typography';
import { Props as RadioButtonProps, RadioButton, Variant } from './radio-button';
import { StyledContainer } from './style';

export type Props = {
  /**
   * Identifier of the radio button group, will be used in name attribute of radio button input
   */
  identifier: string;
  /**
   * Will be used in onChange handler of radio button input
   */
  onSelectionHandler: InputHTMLAttributes<HTMLInputElement>['onChange'];
  label?: string;
  description?: string;
  variant?: Variant;
  isDisabled?: boolean;
  isRequired?: boolean;
  /**
   * For react form
   */
  register?: UseFormRegister<any>;
  radioButtons: Pick<RadioButtonProps, 'value' | 'label' | 'description'>[];
  errorMessage?: string;
} & FileSGProps;

export const RadioButtonGroup = forwardRef<HTMLInputElement, Props>(
  (
    { identifier, onSelectionHandler, label, variant, isDisabled, isRequired, radioButtons, description, register, errorMessage }: Props,
    ref,
  ) => {
    const theme = useTheme();

    const derivedRadioGroupIdentifier = register ? identifier : `${identifier}-${Math.random().toString(16).slice(2)}`;
    return (
      <StyledContainer role="radiogroup" ref={ref} data-testid={TEST_IDS.RADIO_BUTTON_GROUP} $variant={variant}>
        {label && (
          <Typography variant="BODY" bold="FULL" data-testid={TEST_IDS.RADIO_BUTTON_GROUP_LABEL}>
            {label}
          </Typography>
        )}
        {description && (
          <Typography variant="SMALL" color={theme.FSG_COLOR.GREYS.GREY60} data-testid={TEST_IDS.RADIO_BUTTON_GROUP_DESCRIPTION}>
            {description}
          </Typography>
        )}

        {radioButtons.map(({ value, description: radioButtonDescription, label }, index) => (
          <RadioButton
            key={`${identifier}-rb-${index}`}
            onSelectionHandler={onSelectionHandler}
            label={label}
            radioGroupIdentifier={derivedRadioGroupIdentifier}
            value={value}
            description={radioButtonDescription}
            variant={variant}
            isDisabled={isDisabled}
            isRequired={isRequired}
            register={register}
          />
        ))}

        {errorMessage && <ErrorIconLabel errorMessage={errorMessage} />}
      </StyledContainer>
    );
  },
);
