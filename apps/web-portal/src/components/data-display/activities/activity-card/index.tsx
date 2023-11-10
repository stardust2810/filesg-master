import { ActiveActivityResponse } from '@filesg/common';
import { FileSGProps, Tag, Typography, useKeyPress } from '@filesg/design-system';
import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { TEST_IDS, WebPage } from '../../../../consts';
import { FileList } from '../../../../pages/app/activities/components/file-list';
import { AgencyDateTime } from '../../agency-date-time';
import {
  AgencyLogo,
  StyledActionsContainer,
  StyledActivityDetails,
  StyledActivityInfoAndActionWrapper,
  StyledCircle,
  StyledContainer,
} from './style';

type Props = {
  activity: ActiveActivityResponse;
  disabled?: boolean;
  measure?: () => void;
} & FileSGProps;

/**
 * Activity card is an organism component used to surface activity information in Home and All Activities page
 */
export const ActivityCard = ({ measure, activity, style, ...rest }: Props) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  const onClickHandler = useCallback(() => {
    const prevPath = pathname === WebPage.ACTIVITIES ? `${pathname}${search}` : undefined;
    navigate(`${WebPage.ACTIVITIES}/${activity.uuid}`, { state: { prevPath } });
  }, [navigate, pathname, search, activity.uuid]);

  useKeyPress('Enter', () => onEnterHandler());

  const onEnterHandler = () => {
    if (ref.current === document.activeElement) {
      onClickHandler();
    }
  };

  const { files, agency, createdAt, transactionName, isAcknowledgementRequired, acknowledgedAt } = activity;

  const elementLocatorId = rest['data-testid'];
  const isPendingAcknowledgement = isAcknowledgementRequired && !acknowledgedAt;

  return (
    <StyledContainer
      role="link"
      ref={ref}
      style={style}
      tabIndex={0}
      onClick={onClickHandler}
      data-testid={elementLocatorId ? elementLocatorId : `${TEST_IDS.ACTIVITY}`}
    >
      <StyledCircle>
        <AgencyLogo
          src={`/assets/images/icons/agency/${agency.code.toLowerCase()}/emblem.png`}
          alt={`${agency.code} Logo`}
          aria-hidden={true}
        />
      </StyledCircle>
      <StyledActivityInfoAndActionWrapper>
        <StyledActivityDetails>
          <AgencyDateTime agencyCode={agency.code} dateTime={createdAt}></AgencyDateTime>
          <Typography
            variant="BODY"
            data-testid={elementLocatorId ? `${elementLocatorId}-${TEST_IDS.ACTIVITY_TITLE}` : `${TEST_IDS.ACTIVITY_TITLE}`}
          >
            {transactionName}
          </Typography>

          <FileList
            isPendingAcknowledgement={isPendingAcknowledgement}
            measure={measure}
            files={files}
            listName={elementLocatorId ? elementLocatorId : `${TEST_IDS.ACTIVITY}`}
          ></FileList>
        </StyledActivityDetails>
        <StyledActionsContainer>{isPendingAcknowledgement && <Tag color="PRIMARY">Acknowledge</Tag>}</StyledActionsContainer>
      </StyledActivityInfoAndActionWrapper>
    </StyledContainer>
  );
};
