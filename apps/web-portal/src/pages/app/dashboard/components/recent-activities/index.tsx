import { ActiveActivityResponse, ACTIVITY_SORT_BY } from '@filesg/common';
import { Color, FSG_DEVICES, RESPONSIVE_VARIANT, TextButton, TextLink, Tooltip, Typography, useShouldRender } from '@filesg/design-system';
import { useEffect, useState } from 'react';

import { ActivityCard } from '../../../../../components/data-display/activities/activity-card';
import { ActivitySkeleton } from '../../../../../components/data-display/activities/activity-card-skeleton';
import { MINIMUM_LOAD_DELAY_IN_MILLISECONDS, WebPage } from '../../../../../consts';
import { useAppSelector } from '../../../../../hooks/common/useSlice';
import { useAllActivities } from '../../../../../hooks/queries/useAllActivities';
import { selectAccessibleAgencies, selectIsCorporateUser } from '../../../../../store/slices/session';
import {
  StyledActivitiesContainer,
  StyledErrorOrNoActivitiesContainer,
  StyledNavContainer,
  StyledRecentActitiesContainer,
  StyledTitleContainer,
} from './style';

const TEST_IDS = {
  RECENT_ACTIVITIES: 'recent-activities',
  RECENT_ACTIVITIES_SKELETON: 'recent-activities-skeleton',
  RECENT_ACTIVITIES_HEADER: 'recent-activities-header',
  RECENT_ACTIVITIES_TOOLTIP: 'recent-activities-tooltip',
  RECENT_ACTIVITY: 'recent-activity',
  EMPTY_RECENT_ACTIVITIES: 'empty-recent-activities',
  TO_ALL_ACTIVITIES_BUTTON: 'to-all-activities-btn',
  RECENT_ACTIVITIES_LEARN_MORE_BUTTON: 'recent-activities-learn-more-btn',
};

const ITEMS_PER_FETCH = 3;
const SECTION_TITLE = 'Recent Activities';
const EMPTY_MESSAGE = 'No activities yet!';
const EMPTY_MESSAGE_DESCRIPTION = 'Your recent file transactions with government agencies will be listed here.';
const ERROR_MESSAGE = 'We can’t seem to load your recent activities.';

const generateTooltipContent = (isCorporateUser?: boolean) => {
  return `Your ${isCorporateUser ? "company's" : ''} recent file transactions with government agencies`;
};

const generateTooltipAriaLabel = (isCorporateUser?: boolean) => {
  return `Your ${isCorporateUser ? "company's" : ''} recent file transactions with government agencies`;
};

export const RecentActivities = () => {
  const [activities, setActivities] = useState<ActiveActivityResponse[]>();
  const [show, setShow] = useState(false);
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const accessibleAgencies = useAppSelector(selectAccessibleAgencies);

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  const {
    isLoading,
    isError,
    data,
    refetch: fetchRecentActivities,
  } = useAllActivities({
    sortBy: ACTIVITY_SORT_BY.CREATED_AT,
    asc: false,
    page: 1,
    limit: ITEMS_PER_FETCH,
    agencyCodes: accessibleAgencies?.map(({ code }) => code),
  });

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  useEffect(() => {
    fetchRecentActivities();
  }, [fetchRecentActivities]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, MINIMUM_LOAD_DELAY_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data) {
      const tempList: ActiveActivityResponse[] = [];

      data.pages.forEach((page) => {
        page.items.forEach((activity) => {
          tempList.push(activity);
        });
      });

      setActivities(tempList);
    }
  }, [data]);

  const renderActivities = () => {
    switch (true) {
      case isLoading || (!isLoading && !show):
        return (
          <StyledActivitiesContainer data-testid={TEST_IDS.RECENT_ACTIVITIES_SKELETON}>
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </StyledActivitiesContainer>
        );
      case isError:
        return (
          <StyledErrorOrNoActivitiesContainer>
            <Typography variant="BODY">{ERROR_MESSAGE}</Typography>
            <TextButton
              label={'Reload Activities'}
              endIcon="sgds-icon-refresh"
              color={Color.PURPLE_DEFAULT}
              onClick={() => fetchRecentActivities()}
            />
          </StyledErrorOrNoActivitiesContainer>
        );
      case activities && activities?.length === 0:
        return (
          <StyledErrorOrNoActivitiesContainer data-testid={TEST_IDS.EMPTY_RECENT_ACTIVITIES}>
            <Typography variant="BODY">{EMPTY_MESSAGE}</Typography>
            <Typography variant="BODY">{EMPTY_MESSAGE_DESCRIPTION}</Typography>
          </StyledErrorOrNoActivitiesContainer>
        );
      case activities && activities.length > 0:
        return (
          <StyledActivitiesContainer>
            {activities?.map((activity, index) => (
              <ActivityCard key={index} data-testid={`${TEST_IDS.RECENT_ACTIVITIES}-${index}`} activity={activity}></ActivityCard>
            ))}
            <StyledNavContainer>
              <TextLink
                endIcon={'sgds-icon-arrow-right'}
                type={'LINK'}
                to={WebPage.ACTIVITIES}
                data-testid={TEST_IDS.TO_ALL_ACTIVITIES_BUTTON}
                underline={false}
              >
                View all activities
              </TextLink>
            </StyledNavContainer>
          </StyledActivitiesContainer>
        );
      default:
        return null;
    }
  };
  return (
    <StyledRecentActitiesContainer>
      <StyledTitleContainer data-testid={TEST_IDS.RECENT_ACTIVITIES_HEADER}>
        <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} overrideFontFamily="Work Sans" bold="SEMI" color={Color.GREY80}>
          {SECTION_TITLE}
        </Typography>
        <Tooltip
          data-testid={TEST_IDS.RECENT_ACTIVITIES_TOOLTIP}
          iconSize="ICON_SMALL"
          content={generateTooltipContent(isCorporateUser)}
          identifier="recent_activities"
          aria-label={generateTooltipAriaLabel(isCorporateUser)}
        />
      </StyledTitleContainer>
      {renderActivities()}
    </StyledRecentActitiesContainer>
  );
};
