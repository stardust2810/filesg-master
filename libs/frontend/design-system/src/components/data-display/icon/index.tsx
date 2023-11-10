import { Color } from '../../../styles/color';
import { IconFileTypeLiterals, IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { isSGDS } from '../../../utils/helper';
import { FileSGProps } from '../../../utils/typings';
import { StyledSpan } from './style';

export type Props = {
  /**
   * Icon to be displayed
   */
  icon: IconLiterals | IconFileTypeLiterals;
  /**
   * Size of icon
   *
   * Mini: 16px,
   * Small: 20px,
   * Normal: 24px,
   * Large: 32px,
   */
  size?: 'ICON_NORMAL' | 'ICON_SMALL' | 'ICON_LARGE' | 'ICON_MINI';
  /**
   * Color of icon
   */
  color?: Color;
} & FileSGProps;

/**
 * Icon is an atomic component used to convey message via visual means
 */
export const Icon = ({ size = 'ICON_NORMAL', icon, color, className, ...rest }: Props): JSX.Element => {
  const iconClass = isSGDS(icon) ? 'sgds-icon' : 'fsg-icon';
  return (
    <StyledSpan
      className={`${iconClass} ${icon} ${className}`}
      size={size}
      role="img"
      color={color}
      data-testid={rest['data-testid'] ?? TEST_IDS.ICON}
      aria-hidden={rest['aria-hidden'] === undefined ? true : rest['aria-hidden']}
      aria-label={rest['aria-label'] ?? ''}
    />
  );
};
