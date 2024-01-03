import { ButtonHTMLAttributes } from 'react';

import { Color } from '../../../styles/color';
import { FSGFont } from '../../../typings/fsg-theme';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { Typography } from '../../data-display/typography';
import { StyledButton } from './style';

export type Props = {
  label: React.ReactNode | React.ReactNode[];
  variant?: keyof FSGFont;
  bold?: 'FULL' | 'SEMI';
  startIcon?: IconLiterals;
  endIcon?: IconLiterals;
  disabled?: boolean;
  color?: Color;
  type?: 'button' | 'submit' | 'reset';
  isEllipsis?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
} & FileSGProps;

export const TextButton = ({
  label,
  variant = 'BODY',
  bold,
  startIcon,
  endIcon,
  color = Color.GREY80,
  type,
  onClick,
  disabled,
  className,
  isEllipsis = true,
  ...rest
}: Props) => {
  function onClickHandler(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    onClick && onClick(event);
  }

  return (
    <StyledButton
      color={color}
      onClick={onClickHandler}
      className={className}
      data-testid={rest['data-testid'] ?? TEST_IDS.TEXT_BUTTON}
      disabled={disabled}
      type={type}
      aria-label={rest['aria-label']}
      style={rest['style']}
    >
      {startIcon && <Icon icon={startIcon} size="ICON_NORMAL" color={color} />}
      <Typography
        asSpan={true}
        variant={variant}
        bold={bold}
        isEllipsis={isEllipsis}
        ellipsisLine={isEllipsis ? 1 : undefined}
        textAlign="inherit"
      >
        {label}
      </Typography>
      {endIcon && <Icon icon={endIcon} size="ICON_NORMAL" color={color} />}
    </StyledButton>
  );
};
