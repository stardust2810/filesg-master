import { Color, Typography } from '@filesg/design-system';

import { TEST_IDS } from '../../../consts';
import { toDateTimeFormat } from '../../../utils/common';
import { StyledAgencyDateTime } from './style';

type Props = {
  agencyCode: string;
  dateTime: Date;
};

export const AgencyDateTime = ({ agencyCode, dateTime }: Props) => {
  const formattedDateTime = toDateTimeFormat(dateTime);
  return (
    <StyledAgencyDateTime data-testid={TEST_IDS.AGENCY_DATE_TIME}>
      <Typography variant="SMALL" color={Color.GREY60} aria-label={`Created on ${formattedDateTime}`}>
        {formattedDateTime}
      </Typography>
      <Typography variant="SMALL" color={Color.GREY60}>
        ·
      </Typography>
      {/* The aria-label is just "issued by" because the agency code will be read right after.*/}
      <Typography variant="SMALL" color={Color.GREY60} aria-label={`Issued by`}>
        {agencyCode}
      </Typography>
    </StyledAgencyDateTime>
  );
};
