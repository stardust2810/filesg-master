import { ActivityDetailsResponse } from '@filesg/common';
import {
  Breadcrumb,
  Color,
  ErrorInfo,
  FSG_DEVICES,
  Icon,
  RESPONSIVE_VARIANT,
  ResponsiveRenderer,
  Skeleton,
  TextLink,
  Typography,
} from '@filesg/design-system';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import notFoundImage from '../../../assets/images/common/error/page-not-found-error.svg';
import { AgencyDateTime } from '../../../components/data-display/agency-date-time';
import { RightSideBar } from '../../../components/data-display/right-side-bar';
import { ItemDetailsSkeleton } from '../../../components/feedback/skeleton-loader/item-details-skeleton';
import { MINIMUM_LOAD_DELAY_IN_MILLISECONDS, TEST_IDS, WebPage } from '../../../consts';
import { WOGAA_TRACKING_ID } from '../../../consts/analytics';
import { INFO_NOT_LOADED_ERROR } from '../../../consts/error';
import { useBlockerPrompt } from '../../../hooks/common/useBlockerPrompt';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { useTimer } from '../../../hooks/common/useTimer';
import { useActivityDetails } from '../../../hooks/queries/useActivityDetails';
import { selectIsShowingLoginModal } from '../../../store/slices/app';
import {
  resetNonSingpassSession,
  selectContentRetrievalToken,
  selectIsSessionWarningPopUpShown,
  selectNonSingpassVerified,
  selectWarningDurationSecs,
} from '../../../store/slices/non-singpass-session';
import { trackWogaaTransaction } from '../../../utils/common';
import { ACTIVITY_DETAILS_MODE, ActivityDetails } from './components/activity-details-sidebar';
import { IndividualActivity } from './components/individual-activity';
import { IndividualActivitySkeleton } from './components/individual-activity-skeleton';
import {
  StyledActivityInfoContainer,
  StyledActivityMainContent,
  StyledBreadcrumbLink,
  StyledIcon,
  StyledSenderInformation,
  StyledWrapper,
} from './style';

type UrlParams = 'activityUuid';

const notLoadedError = INFO_NOT_LOADED_ERROR('activity details');
export interface LocationState {
  prevPath?: string;
}
const Activity = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const params = useParams<UrlParams>();

  const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);
  const isNonSingpassVerified = useAppSelector(selectNonSingpassVerified);
  const isShowingLoginModal = useAppSelector(selectIsShowingLoginModal);
  const isSessionWarningPopUpShown = useAppSelector(selectIsSessionWarningPopUpShown);
  const warningDurationSecs = useAppSelector(selectWarningDurationSecs);
  const hasValidRetrivalToken = useAppSelector(selectContentRetrievalToken);

  const [show, setShow] = useState(false);
  const [activity, setActivity] = useState<ActivityDetailsResponse>();

  // ===========================================================================
  // Queries
  // ===========================================================================
  const {
    isLoading,
    isError,
    error: activityError,
    data: activityData,
    refetch: fetchActivityDetails,
  } = useActivityDetails(params.activityUuid!, contentRetrievalToken);

  // =============================================================================
  // Common effects
  // =============================================================================
  useEffect(() => {
    if (isNonSingpassVerified) {
      trackWogaaTransaction('COMPLETE', WOGAA_TRACKING_ID.NON_SINGPASS_RETRIEVAL);
    }
  }, [isNonSingpassVerified]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, MINIMUM_LOAD_DELAY_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, []);

  // ===========================================================================
  // Page title
  // ===========================================================================
  useEffect(() => {
    fetchActivityDetails();
  }, [contentRetrievalToken, fetchActivityDetails]);

  usePageTitle(activityData?.transactionName ?? 'Activity');

  useEffect(() => {
    setActivity(activityData);
  }, [activityData]);

  // ===========================================================================
  // Blocker prompt
  // ===========================================================================
  const handleLogout = useCallback(() => {
    dispatch(resetNonSingpassSession());
  }, [dispatch]);

  const { block, unblock } = useBlockerPrompt(
    'Are you sure you want to leave?\n\nYour session will be terminated and you will be required to verify your identity again to access your documents if you decide to leave.',
    handleLogout,
  );
  const { timerDone, startTimer } = useTimer((warningDurationSecs - 2) * 1000);

  useEffect(() => {
    if (isNonSingpassVerified) {
      isShowingLoginModal ? unblock() : block();
    }
  }, [block, unblock, isNonSingpassVerified, isShowingLoginModal]);

  useEffect(() => {
    if (isSessionWarningPopUpShown) {
      startTimer();
    }
  }, [isSessionWarningPopUpShown, startTimer]);

  useEffect(() => {
    if (timerDone) {
      unblock();
    }
  }, [timerDone, unblock]);

  useEffect(() => {
    if (hasValidRetrivalToken === '') {
      unblock();
    }
  }, [hasValidRetrivalToken, unblock]);

  const isPageLoading = isLoading || (!isLoading && !show);

  const getPrevPath = () => {
    const prevPath = (location.state as LocationState)?.prevPath;
    if (prevPath) {
      return prevPath;
    }

    // If no prevPath (e.g.: From external webpage), nav to myFiles
    return WebPage.ACTIVITIES;
  };
  const renderActivity = () => {
    switch (true) {
      case isPageLoading:
        return (
          <StyledActivityInfoContainer data-testid={TEST_IDS.ACTIVITY_PAGE_SKELETON}>
            {!isNonSingpassVerified && <Skeleton variant="TEXT" textVariant="SMALL" width={150} />}

            <StyledSenderInformation>
              <Skeleton variant="RECTANGLE" width={137} height={64} />
              <Skeleton variant="TEXT" textVariant="SMALL" width={160} />
            </StyledSenderInformation>
            <IndividualActivitySkeleton />
          </StyledActivityInfoContainer>
        );
      case isError:
        return activityError!.response?.status === 404 ? (
          <ErrorInfo
            image={notFoundImage}
            title="We can't seem to find the activity you are looking for"
            descriptions={[
              'Check that the URL entered is correct, and try again.',
              <Typography variant="BODY">
                Please note that only document recipients themselves can view their documents via Singpass login.
              </Typography>,
              <Typography variant="BODY">
                If you do not have a Singpass account, or if you are retrieving a document on behalf of the document recipient, you will
                need to {` `}
                <TextLink
                  font="BODY"
                  to={`${WebPage.FAQ}${WebPage.RETRIEVING_YOUR_DOCUMENTS}#document-retrieval`}
                  type="LINK"
                  isInline={true}
                >
                  retrieve the document without a Singpass account
                </TextLink>
                .
              </Typography>,
            ]}
          />
        ) : (
          <ErrorInfo image={notLoadedError.image} title={notLoadedError.title} descriptions={notLoadedError.descriptions} />
        );
      default:
        return (
          activity && (
            <StyledActivityMainContent>
              {/* Activity content */}
              <StyledActivityInfoContainer>
                {!isNonSingpassVerified && (
                  <Breadcrumb
                    itemMaxWidth={200}
                    itemEllipsis={false}
                    separator={<Icon size="ICON_MINI" icon="sgds-icon-chevron-left" color={Color.GREY30} />}
                    reverse
                    reverseIncludeLast={false}
                  >
                    <StyledBreadcrumbLink to={getPrevPath()}>Back to All Activities</StyledBreadcrumbLink>
                  </Breadcrumb>
                )}
                <StyledSenderInformation>
                  <StyledIcon
                    src={`/assets/images/icons/agency/${activity.agency.code.toLowerCase()}/logo.png`}
                    alt={`${activity.agency.code} Logo`}
                  />
                  <AgencyDateTime agencyCode={activity.agency.code} dateTime={activity.createdAt} />
                </StyledSenderInformation>
                <IndividualActivity activity={activity} isNonSingpassSession={!!contentRetrievalToken} onFileLabelClick={unblock} />
                <ResponsiveRenderer variant={RESPONSIVE_VARIANT.SMALLER_THAN} device={FSG_DEVICES.SMALL_DESKTOP}>
                  <ActivityDetails mode={ACTIVITY_DETAILS_MODE.CARD} activity={activity} />
                </ResponsiveRenderer>
              </StyledActivityInfoContainer>{' '}
            </StyledActivityMainContent>
          )
        );
    }
  };
  return (
    <StyledWrapper>
      {renderActivity()}

      <ResponsiveRenderer variant={RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO} device={FSG_DEVICES.SMALL_DESKTOP}>
        <RightSideBar>
          {isPageLoading ? (
            <ItemDetailsSkeleton />
          ) : (
            activity && <ActivityDetails mode={ACTIVITY_DETAILS_MODE.SIDEBAR} activity={activity} />
          )}
        </RightSideBar>
      </ResponsiveRenderer>
    </StyledWrapper>
  );
};

export default Activity;
