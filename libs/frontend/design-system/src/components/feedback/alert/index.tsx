import { useTheme } from 'styled-components';

import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { IconLabel } from '../../data-display/icon-label';
import { StyledDiv } from './style';

export type Props = {
  /**
   * Style variant of alert
   */
  variant: 'DANGER' | 'SUCCESS' | 'WARNING' | 'INFO';
  /**
   * Flag to indicate if alert should take up the width of its parent component
   */
  block?: boolean;
  /**
   * Content of alert
   */
  children: React.ReactNode | React.ReactNode[];
} & FileSGProps;

type VariantIcon = {
  [key: string]: IconLiterals;
};

const variantIcon: VariantIcon = {
  DANGER: 'fsg-icon-circle-cross-solid',
  SUCCESS: 'fsg-icon-circle-check-solid',
  WARNING: 'fsg-icon-triangle-warning-solid',
  INFO: 'fsg-icon-circle-info-solid',
};

/**
 * Alert is an organism component used to display important message without discrupting user's current flow
 */
export const Alert = ({ variant, children, block, className, role, ...rest }: Props): JSX.Element => {
  const themeContext = useTheme();

  return (
    <StyledDiv role={role} variant={variant} block={block} className={className} data-testid={rest['data-testid'] ?? TEST_IDS.ALERT}>
      <IconLabel
        icon={variantIcon[variant]}
        iconColor={themeContext.FSG_COLOR[variant].DEFAULT}
        iconSize="ICON_NORMAL"
        description={children}
      />
    </StyledDiv>
  );
};
