import React, { forwardRef, InputHTMLAttributes, isValidElement } from 'react';

import { Color } from '../../../styles/color';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { StyledCheckbox, StyledInput, StyledLabel, StyledText } from './style';

export type Props = {
  icon?: IconLiterals;
  selected?: boolean;
  label?: string | React.ReactNode;
  frame?: boolean;
  color?: Color;
  disabled?: boolean;
  name?: string;
  onChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
} & FileSGProps;

export const Checkbox = forwardRef<HTMLInputElement, Props>(
  (
    {
      icon = 'sgds-icon-check',
      selected,
      label,
      frame = false,
      color = Color.PURPLE_DEFAULT,
      disabled = false,
      onChange,
      className = '',
      name = '',
      ...rest
    }: Props,
    ref,
  ) => {
    return (
      <StyledLabel
        color={color}
        frame={frame}
        disabled={disabled}
        className={className}
        data-testid={rest['data-testid'] ?? TEST_IDS.CHECKBOX}
      >
        <StyledInput
          name={name}
          ref={ref}
          checked={selected}
          type="checkbox"
          disabled={disabled}
          onChange={onChange}
          color={color}
          frame={frame}
        />
        <StyledCheckbox>
          <Icon icon={icon} size="ICON_MINI" color={Color.WHITE} />
        </StyledCheckbox>
        {label &&
          (isValidElement(label) ? (
            label
          ) : (
            <StyledText variant="BODY" disabled={disabled}>
              {label}
            </StyledText>
          ))}
      </StyledLabel>
    );
  },
);
