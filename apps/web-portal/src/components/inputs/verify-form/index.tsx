import {
  Button,
  Color,
  FSG_DEVICES,
  IconLabel,
  RESPONSIVE_VARIANT,
  TextInputField,
  TextInputLabel,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { ChangeEventHandler, Dispatch, MouseEventHandler, SetStateAction, useEffect } from 'react';
import { UseFormRegister, UseFormSetFocus, Validate } from 'react-hook-form';

import {
  StyledButtonContainer,
  StyledInputAndErrorContainer,
  StyledInputContainer,
  StyledInputRow,
  StyledLabelAndFieldContainer,
} from './style';

interface Props {
  label: string;
  formName: string;
  type: 'email' | 'tel';
  placeholder?: string;
  value?: string;
  register: UseFormRegister<any>;
  validate: Validate<string> | Record<string, Validate<string>>;
  setFocus: UseFormSetFocus<any>;
  errorMessage?: string;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  onCancelHandler: MouseEventHandler<HTMLButtonElement>;
  onChangeHandler?: ChangeEventHandler<HTMLInputElement>;
  isLoadingVerify?: boolean;
  disableInput?: boolean;
  disableVerifyButton?: boolean;
}

export function VerifyForm({
  label,
  formName,
  type,
  placeholder,
  value,
  register,
  validate,
  setFocus,
  errorMessage,
  onCancelHandler,
  onChangeHandler,
  isEditing,
  setIsEditing,
  isLoadingVerify,
  disableInput = false,
  disableVerifyButton,
  ...rest
}: Props) {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  const locatorId = rest['data-testid'];

  useEffect(() => {
    if (isEditing) {
      setFocus(formName);
    }
  }, [formName, isEditing, setFocus]);

  return (
    <StyledInputContainer>
      <StyledInputRow>
        <StyledLabelAndFieldContainer>
          <TextInputLabel label={label} fieldId={formName} />
          {!isEditing && (
            <>
              <Typography data-testid={locatorId} variant="BODY">
                {value ? value : '-'}
              </Typography>
              {errorMessage && (
                <IconLabel
                  role="alert"
                  iconSize="ICON_SMALL"
                  icon="sgds-icon-circle-warning"
                  iconColor={Color.RED_DEFAULT}
                  gap="0.5rem"
                  description={
                    <Typography variant="BODY" color={Color.RED_DEFAULT}>
                      {errorMessage}
                    </Typography>
                  }
                />
              )}
            </>
          )}
        </StyledLabelAndFieldContainer>

        {!isEditing && (
          <StyledButtonContainer>
            <Button
              data-testid={locatorId + '-edit-btn'}
              aria-label={`Edit ${label}`}
              color="DEFAULT"
              decoration="OUTLINE"
              key="edit"
              label="Edit"
              onClick={() => setIsEditing(true)}
              fullWidth={isSmallerThanSmallTablet}
            />
          </StyledButtonContainer>
        )}
      </StyledInputRow>

      <StyledInputRow hide={!isEditing}>
        <StyledInputAndErrorContainer>
          <TextInputField
            data-testid={locatorId}
            fieldId={formName}
            type={type}
            placeholder={placeholder}
            disabled={disableInput}
            errorMessage={errorMessage}
            errorElementId={`filesg-error-id-${formName}`}
            {...register(formName, {
              validate,
              onChange: onChangeHandler,
            })}
          />
        </StyledInputAndErrorContainer>
        {isEditing && ( // dismount button to prevent ripple from from edit button
          <StyledButtonContainer>
            <Button
              data-testid={locatorId + '-cancel-btn'}
              key="cancel"
              decoration="GHOST"
              color="DEFAULT"
              label="Cancel"
              onClick={onCancelHandler}
              fullWidth={isSmallerThanSmallTablet}
              type="button"
            />
            <Button
              data-testid={locatorId + '-verify-btn'}
              key="verify"
              type="submit"
              label="Verify"
              fullWidth={isSmallerThanSmallTablet}
              isLoading={isLoadingVerify}
              disabled={disableVerifyButton}
            />
          </StyledButtonContainer>
        )}
      </StyledInputRow>
    </StyledInputContainer>
  );
}
