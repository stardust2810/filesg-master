import { FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useEffect } from 'react';

import logoutImage from '../../../assets/images/logout.svg';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { selectCreatedAt, selectEndedAt, updateSession } from '../../../store/slices/session';
import { toDateTimeFormat } from '../../../utils/common';
import { LogoutInfoContainer, PageWrapper, StyledData, StyledHeader, StyledImage, StyledPageInfo, StyledRow } from './style';
const LOGIN = 'Login';
const LOGOUT = 'Logout';
const DURATION = 'Duration';

const Logout = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const sessionCreatedAt = new Date(useAppSelector(selectCreatedAt)!);
  const sessionEndedAt = new Date(useAppSelector(selectEndedAt)!);
  const duration = intervalToDuration({ start: sessionCreatedAt, end: sessionEndedAt });
  const formattedDuration = formatDuration(duration);
  const loginTime = toDateTimeFormat(sessionCreatedAt);
  const logoutTime = toDateTimeFormat(sessionEndedAt);
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  usePageTitle(LOGOUT);

  useEffect(() => {
    return () => {
      dispatch(
        updateSession({
          isAfterLogout: false,
        }),
      );
    };
  }, [dispatch]);

  function getStyledHeader(header: string) {
    return (
      <StyledHeader>
        <Typography variant="BODY" bold="FULL" data-testid={`logout-info-table-header-${header}`}>
          {header}
        </Typography>
      </StyledHeader>
    );
  }

  function getStyledData(data: string, type: string) {
    return (
      <StyledData>
        <Typography variant="BODY" data-testid={`logout-info-table-data-${type}`}>
          {data}
        </Typography>
      </StyledData>
    );
  }

  return (
    <PageWrapper>
      <LogoutInfoContainer>
        <StyledPageInfo>
          <StyledImage src={logoutImage} alt={''} />

          <Typography variant="H1" bold="FULL" data-testid="logout-header">
            You have successfully logged out
          </Typography>
          <Typography variant="BODY" data-testid="logout-header">
            To protect your personal data, please clear your browser’s cache after each session.
          </Typography>
        </StyledPageInfo>
        {isSmallerThanSmallTablet ? (
          <table style={{ width: 'auto' }}>
            <tbody>
              <StyledRow>
                {getStyledHeader(LOGIN)}
                {getStyledData(loginTime, 'loginTime')}
              </StyledRow>
              <StyledRow>
                {getStyledHeader(LOGOUT)}
                {getStyledData(logoutTime, 'logoutTime')}
              </StyledRow>
              <StyledRow>
                {getStyledHeader(DURATION)}
                {getStyledData(formattedDuration, 'formattedDuration')}
              </StyledRow>
            </tbody>
          </table>
        ) : (
          <table>
            <tbody>
              <StyledRow>
                {getStyledHeader(LOGIN)}
                {getStyledHeader(LOGOUT)}
                {getStyledHeader(DURATION)}
              </StyledRow>
              <StyledRow>
                {getStyledData(loginTime, 'loginTime')}
                {getStyledData(logoutTime, 'logoutTime')}
                {getStyledData(formattedDuration, 'formattedDuration')}
              </StyledRow>
            </tbody>
          </table>
        )}
      </LogoutInfoContainer>
    </PageWrapper>
  );
};

export default Logout;
