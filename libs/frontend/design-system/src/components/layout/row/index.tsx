import { StyleProps } from '../../../utils/typings';
import { StyledRow } from './style';

export type Props = {
  children: React.ReactNode | React.ReactNode[];
  isMobile?: boolean;
  isDesktop?: boolean;
  isMultiline?: boolean;
} & StyleProps;

export const Row = ({
  children,
  isDesktop = false,
  isMobile = false,
  isMultiline = true,
  ...props
}: Props): JSX.Element => {
  return (
    <StyledRow isMobile={isMobile} isDesktop={isDesktop} isMultiline={isMultiline} {...props}>
      {children}
    </StyledRow>
  );
};
