import { AnchorHTMLAttributes, PropsWithChildren } from 'react';

import { FSGFont } from '../../../typings/fsg-theme';
import { IconLiterals } from '../../../typings/icon-literals';
import { Icon } from '../../data-display/icon';
import { Typography } from '../../data-display/typography';
import { StyledAnchor, StyledAnchorLink, StyledEndIcon, StyledLink } from './style';

export type Props = {
  type: 'LINK' | 'ANCHOR';
  to: string;
  newTab?: boolean;
  font?: keyof FSGFont;
  bold?: 'FULL' | 'SEMI';
  disabled?: boolean;
  startIcon?: IconLiterals;
  endIcon?: IconLiterals;
  iconSize?: 'ICON_NORMAL' | 'ICON_SMALL' | 'ICON_LARGE' | 'ICON_MINI';
  replace?: boolean;
  underline?: boolean;
  isInline?: boolean;
  'data-testid'?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function TextLink({
  type,
  to,
  newTab = false,
  font = 'BODY',
  bold,
  disabled = false,
  children,
  startIcon,
  endIcon,
  iconSize = 'ICON_SMALL',
  replace = false,
  underline = true,
  isInline = false,
  onClick,
  style,
  className,
  ...rest
}: PropsWithChildren<Props>) {
  return type === 'LINK' ? (
    <StyledLink
      onClick={onClick}
      to={to}
      target={newTab ? '_blank' : undefined}
      disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      replace={replace}
      style={style}
      className={className}
      $isInline={isInline}
    >
      {startIcon && <Icon icon={startIcon} size={iconSize} />}
      <Typography asSpan={true} variant={font} bold={bold} data-testid={rest['data-testid'] ?? 'text-link'} underline={underline}>
        {children}
      </Typography>

      {endIcon && <Icon icon={endIcon} size={iconSize} />}
    </StyledLink>
  ) : (
    <StyledAnchor
      onClick={onClick}
      href={to}
      target={newTab ? '_blank' : undefined}
      disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
    >
      {startIcon && <Icon icon={startIcon} size={iconSize} />}
      <StyledAnchorLink>
        <Typography asSpan={true} variant={font} bold={bold} data-testid={rest['data-testid'] ?? 'text-link'} underline={underline}>
          {children}
        </Typography>
      </StyledAnchorLink>
      {endIcon && <StyledEndIcon icon={endIcon} size={iconSize} />}
    </StyledAnchor>
  );
}
