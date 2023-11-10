import { TEST_IDS } from '../../../utils/constants';
import { toKebabCase } from '../../../utils/helper';
import { FileSGProps } from '../../../utils/typings';
import { Tooltip } from '../../data-display/tooltip';
import { Typography } from '../../data-display/typography';
import { StyledLabel } from './style';

export type Props = {
  label: string;
  fieldId?: string;
  hintText?: string;
} & FileSGProps;

export const TextInputLabel = ({ label, fieldId, hintText }: Props) => {
  return (
    <StyledLabel htmlFor={fieldId} data-testid={TEST_IDS.TEXT_INPUT_LABEL}>
      <Typography variant="BODY" bold="FULL">
        {label}
      </Typography>
      {hintText && <Tooltip identifier={toKebabCase(fieldId + label)} content={hintText} aria-label={hintText} />}
    </StyledLabel>
  );
};
