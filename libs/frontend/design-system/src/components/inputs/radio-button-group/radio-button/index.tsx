import { InputHTMLAttributes } from 'react';
import { UseFormRegister } from 'react-hook-form';

import { TEST_IDS } from '../../../../utils/constants';
import { Typography } from '../../../data-display/typography';
import { StyledLabelContainer, StyledRadioButton } from './style';

export type Variant = 'DEFAULT' | 'WITH_FRAME';

export type Props = {
  radioGroupIdentifier: string;
  value: string;
  radioButtonIdentifier?: string;
  description?: string;
  label?: string;
  variant?: Variant;
  isDisabled?: boolean;
  isRequired?: boolean;
  onSelectionHandler: InputHTMLAttributes<HTMLInputElement>['onChange'];
  register?: UseFormRegister<any>;
};

const RADIO_BUTTON_REQUIRED_ERROR_MESSAGE = 'An option must be selected';
export const RadioButton = ({
  radioGroupIdentifier,
  label,
  description,
  value,
  radioButtonIdentifier,
  onSelectionHandler,
  variant = 'DEFAULT',
  isDisabled = false,
  isRequired = false,
  register,
}: Props) => {
  const derivedRadioButtonIdentifier = radioButtonIdentifier ?? `identifier-${value}`;
  return (
    <StyledRadioButton htmlFor={derivedRadioButtonIdentifier} $variant={variant} data-testid={TEST_IDS.RADIO_BUTTON}>
      <input
        data-testid={TEST_IDS.RADIO_BUTTON_INPUT}
        disabled={isDisabled}
        type="radio"
        id={derivedRadioButtonIdentifier}
        name={radioGroupIdentifier}
        value={value}
        onChange={onSelectionHandler}
        {...register?.(radioGroupIdentifier, {
          required: isRequired ? RADIO_BUTTON_REQUIRED_ERROR_MESSAGE : false,
          onChange: onSelectionHandler,
        })}
      />
      <StyledLabelContainer>
        {label && (
          <Typography variant={'BODY'} bold={'FULL'} data-testid={TEST_IDS.RADIO_BUTTON_LABEL}>
            {label}
          </Typography>
        )}
        {description && (
          <Typography variant={'BODY'} data-testid={TEST_IDS.RADIO_BUTTON_DESCRIPTION}>
            {description}
          </Typography>
        )}
      </StyledLabelContainer>
    </StyledRadioButton>
  );
};
