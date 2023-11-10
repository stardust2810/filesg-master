import { forwardRef, useCallback } from 'react';
import { useTheme } from 'styled-components';

import { TEST_IDS } from '../../../../../utils/constants';
import { toKebabCase } from '../../../../../utils/helper';
import { ButtonColorsTheme } from '../../../../../utils/typings';
import { Icon } from '../../../../data-display/icon';
import { Typography } from '../../../../data-display/typography';
import { StyledOption } from './style';
export type OptionProps = {
  label: string;
  value: string | number;
};

export type Props = {
  color?: ButtonColorsTheme;
  onClick?: (event) => void;
  animateMenuSlideUp?: () => void;
  selectedValue?: string | number;
  size?: 'NORMAL' | 'SMALL';
} & OptionProps;

export const MenuItem = forwardRef<HTMLLIElement, Props>(
  ({ label, color, animateMenuSlideUp, onClick, value, selectedValue, size = 'NORMAL' }, ref) => {
    const theme = useTheme();
    const isSelected = `${selectedValue}` === `${value}`;

    const onClickHandler = useCallback(
      (event) => {
        animateMenuSlideUp?.();
        onClick?.(event);
      },
      [animateMenuSlideUp, onClick],
    );

    const onKeyPressHandler = useCallback(
      (event) => {
        const { keyCode } = event;
        switch (keyCode) {
          // Space/Enter
          case 13:
          case 32:
            onClickHandler(event);
            break;
          default:
            break;
        }
      },
      [onClickHandler],
    );
    return (
      <StyledOption
        ref={ref}
        tabIndex={0}
        role="option"
        onClick={onClickHandler}
        onKeyDown={onKeyPressHandler}
        value={value}
        selected={isSelected}
        color={color}
        data-testid={`${TEST_IDS.MENU_ITEM}-${toKebabCase(label)}`}
        size={size}
        aria-selected={isSelected}
      >
        <Typography variant={`BUTTON_${size}`} isEllipsis ellipsisLine={1}>
          {label}
        </Typography>
        {isSelected ? (
          <Icon icon="sgds-icon-check" size={`ICON_${size}`} color={color && theme.FSG_COLOR[color].DEFAULT} />
        ) : (
          <div style={{ width: '24px' }}></div>
        )}
      </StyledOption>
    );
  },
);
