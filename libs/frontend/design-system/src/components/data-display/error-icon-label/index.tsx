import { Color } from '../../../styles/color';
import { FIELD_ERROR_IDS, TEST_IDS } from '../../../utils/constants';
import { IconLabel } from '../icon-label';
import { Typography } from '../typography';

type Props = {
  errorMessage: string;
  errorElementId?: string;
};
/**
 * Error icon label is a molecule component used to display error message.
 */
export const ErrorIconLabel = ({ errorMessage, errorElementId }: Props): JSX.Element => {
  return (
    <IconLabel
      role="alert"
      iconSize="ICON_SMALL"
      icon="sgds-icon-circle-warning"
      iconColor={Color.RED_DEFAULT}
      gap="0.5rem"
      alignment="CENTER"
      description={
        <Typography variant="BODY" color={Color.RED_DEFAULT}>
          {errorMessage}
        </Typography>
      }
      data-testid={TEST_IDS.TEXT_INPUT_ERROR_PROMPT}
      id={errorElementId ?? FIELD_ERROR_IDS.TEST_FIELD_ERROR}
    />
  );
};
