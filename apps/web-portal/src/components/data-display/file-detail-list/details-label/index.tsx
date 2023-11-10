import { Typography } from '@filesg/design-system';

import { StyledFieldWrapper, StyledTooltip, StyledWrapper } from './style';

interface Props {
  field: string;
  value: string;
  tooltipInfo?: string;
  keyIndex?: string | number;
}

export function DetailsLabel({ field, value, tooltipInfo, keyIndex }: Props) {
  return value ? (
    <StyledWrapper key={`details-label-key-${keyIndex}`} data-testid={`details-label-${keyIndex}`}>
      <StyledFieldWrapper>
        <Typography variant="SMALL" bold="FULL" data-testid={`details-label-field-${keyIndex}`}>
          {field.toUpperCase()}
        </Typography>
        {tooltipInfo && <StyledTooltip messagePosition="top" iconSize="ICON_SMALL" content={tooltipInfo} identifier={`${field}-tooltip`} />}
      </StyledFieldWrapper>
      <Typography variant="BODY" data-testid={`details-label-value-${keyIndex}`}>
        {value}
      </Typography>
    </StyledWrapper>
  ) : null;
}
