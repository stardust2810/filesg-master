import { ActivityDetailsResponse } from '@filesg/common';
import { Color, Icon, MetadataList, Typography } from '@filesg/design-system';

import { StyleProps } from '../../../../../typings';
import { StyledCardContainer, StyledCardDetailsContainer, StyledCardHeader, StyledHeader } from './style';

const DETAILS_HEADER = 'Activity Info';
const DETAILS_HEADER_ICON = 'sgds-icon-list';

const TEST_IDS = {
  ACTIVITY_DETAILS_CARD: 'activity-details-card',
  ACTIVITY_DETAILS_SIDE_BAR: 'activity-details-side-bar',
};

export enum ACTIVITY_DETAILS_MODE {
  CARD = 'card',
  SIDEBAR = 'sidebar',
}

type Props = {
  activity: ActivityDetailsResponse;
  mode?: ACTIVITY_DETAILS_MODE;
} & StyleProps;
export const ActivityDetails = ({ activity, mode = ACTIVITY_DETAILS_MODE.CARD, className }: Props) => {
  const DetailsHeader = ({ title }: { title: string }) => {
    return (
      <StyledHeader>
        <Icon color={Color.GREY30} icon="sgds-icon-list"></Icon>
        <Typography data-testid="filesg-metadata-list-header" variant="PARAGRAPH" bold="FULL">
          {title}
        </Typography>
      </StyledHeader>
    );
  };

  const items = [
    {
      field: 'Agency',
      value: `${activity.agency.name} (${activity.agency.code})`,
    },
    {
      field: 'Agency Ref No.',
      value: `${activity.application.externalRefId ?? '-'}`,
    },
    {
      field: 'Transaction ID',
      value: `${activity.uuid}`,
    },
  ];

  if (mode === ACTIVITY_DETAILS_MODE.SIDEBAR) {
    return <MetadataList title={DETAILS_HEADER} titleIcon={DETAILS_HEADER_ICON} metadata={items} />;
  }

  return (
    <StyledCardContainer className={className} data-testid={TEST_IDS.ACTIVITY_DETAILS_CARD}>
      <StyledCardHeader>
        <DetailsHeader title={DETAILS_HEADER} />
      </StyledCardHeader>
      <StyledCardDetailsContainer>
        <MetadataList metadata={items} />
      </StyledCardDetailsContainer>
    </StyledCardContainer>
  );
};
