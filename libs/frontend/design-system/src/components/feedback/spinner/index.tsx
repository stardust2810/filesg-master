import { Color } from '../../../styles/color';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Typography } from '../../data-display/typography';
import { StyledGradiant, StyledSpinnerSvg, StyledWrapper } from './style';

export type Props = {
  mainMessage?: string;
  secondaryMessage?: string;
} & FileSGProps;

export function Spinner({ mainMessage, secondaryMessage, className, style }: Props) {
  return (
    <StyledWrapper data-testid={TEST_IDS.SPINNER} style={style} className={className}>
      <StyledSpinnerSvg viewBox="0 0 100 100" xlinkHref="http://www.w3.org/1999/xhtml">
        <clipPath id="clip">
          <path d="M 50 0 a 50 50 0 0 1 0 100 50 50 0 0 1 0 -100 v 8 a 42 42 0 0 0 0 84 42 42 0 0 0 0 -84" />
        </clipPath>

        <foreignObject x="0" y="0" width="100" height="100" clipPath="url(#clip)">
          <StyledGradiant />
        </foreignObject>
      </StyledSpinnerSvg>
      {mainMessage && (
        <Typography variant="H2" bold="FULL">
          {mainMessage}
        </Typography>
      )}
      {secondaryMessage && (
        <Typography variant="PARAGRAPH" color={Color.GREY60}>
          {secondaryMessage}
        </Typography>
      )}
    </StyledWrapper>
  );
}
