import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { Props as FieldProps, TextInputField } from '../text-input-field';
import { Props as LabelProps, TextInputLabel } from '../text-input-label';
import { StyledTextInputContainer } from './style';

export type Props = FieldProps & LabelProps & Partial<Omit<UseFormRegisterReturn, 'ref'>>;

export const TextInput = forwardRef<HTMLInputElement, Props>(({ label, fieldId, hintText, ...rest }: Props, ref) => {
  return (
    <StyledTextInputContainer>
      <TextInputLabel label={label} fieldId={fieldId} hintText={hintText} />
      <TextInputField fieldId={fieldId} ref={ref} {...rest} />
    </StyledTextInputContainer>
  );
});
