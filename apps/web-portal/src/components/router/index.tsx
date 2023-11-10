import { Suspense } from 'react';
import { ErrorBoundary, ErrorBoundaryPropsWithComponent } from 'react-error-boundary';
import { Route, Routes, useLocation } from 'react-router-dom';

import { awsRumManager } from '../../config/aws-rum-config';
import { WebPage } from '../../consts';
import BrowserNotSupported from '../../pages/app/errors/templates/browser-not-supported';
import UnexpectedError from '../../pages/app/errors/templates/unexpected-error';
import { lazyWithRefresh } from '../../utils/common';
import { SuspenseFallback } from '../feedback/suspence-fallback';
import { ProtectedOutlet } from './components/protected-outlet';
import { Redirection } from './components/redirected-route';

const MockAuthCallback = lazyWithRefresh(() => import('../../pages/app/mock-auth-callback'));
const AuthCallback = lazyWithRefresh(() => import('../../pages/app/auth-callback'));
const IcaSsoCallback = lazyWithRefresh(() => import('../../pages/app/ica-sso-callback'));

const CitizensPublicLanding = lazyWithRefresh(() => import('../../pages/app/public-landing-citizens'));
const Retrieve = lazyWithRefresh(() => import('../../pages/app/retrieve'));
const Verify = lazyWithRefresh(() => import('../../pages/app/verify'));
const Faq = lazyWithRefresh(() => import('../../pages/app/faq'));
const FaqRedirect = lazyWithRefresh(() => import('../../pages/app/faq-redirect'));
const PrivacyStatement = lazyWithRefresh(() => import('../../pages/app/privacy-statement'));
const TermsOfUse = lazyWithRefresh(() => import('../../pages/app/terms-of-use'));

const NotFoundError = lazyWithRefresh(() => import('../../pages/app/errors/templates/not-found'));

// Protected
const OnBoarding = lazyWithRefresh(() => import('../../pages/app/onboarding'));
const Activity = lazyWithRefresh(() => import('../../pages/app/activity'));
const Activities = lazyWithRefresh(() => import('../../pages/app/activities'));
const Dashboard = lazyWithRefresh(() => import('../../pages/app/dashboard'));
const Files = lazyWithRefresh(() => import('../../pages/app/files'));
const Document = lazyWithRefresh(() => import('../../pages/app/document'));
const Profile = lazyWithRefresh(() => import('../../pages/app/profile'));
const Logout = lazyWithRefresh(() => import('../../pages/app/logout'));

export const Router = () => {
  const location = useLocation();

  const onErrorHandler: ErrorBoundaryPropsWithComponent['onError'] = (error) => {
    awsRumManager.getAwsRum()?.recordError(error);
  };

  return (
    <ErrorBoundary fallback={<UnexpectedError />} onError={onErrorHandler} key={location.pathname}>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path={WebPage.ROOT} element={<Redirection redirectionPath={WebPage.HOME} />} />

          <Route path={WebPage.PUBLIC} element={<CitizensPublicLanding />} />
          <Route path={WebPage.RETRIEVE} element={<Retrieve />} />
          <Route path={WebPage.VERIFY} element={<Verify />} />
          <Route path={WebPage.PRIVACY_STATEMENT} element={<PrivacyStatement />} />
          <Route path={WebPage.TERMS_OF_USE} element={<TermsOfUse />} />
          <Route path={WebPage.BROWSER_NOT_SUPPORTED} element={<BrowserNotSupported />} />
          <Route path={WebPage.FAQ} element={<FaqRedirect />} />
          <Route path={`${WebPage.FAQ}/:subPage`} element={<Faq />} />

          <Route element={<ProtectedOutlet />}>
            <Route path={WebPage.ONBOARDING} element={<OnBoarding />} />
            <Route path={WebPage.HOME} element={<Dashboard />} />
            <Route path={WebPage.ACTIVITIES} element={<Activities />} />
            <Route path={WebPage.FILES} element={<Files />} />
            <Route path={WebPage.PROFILE} element={<Profile />} />
            <Route path={WebPage.LOGOUT} element={<Logout />} />
          </Route>

          <Route element={<ProtectedOutlet allowNonSingpassSession />}>
            <Route path={`${WebPage.ACTIVITIES}/:activityUuid`} element={<Activity />} />
            <Route path={WebPage.FILES}>
              <Route path={`:fileAssetUuid`} element={<Document />} />
            </Route>
          </Route>

          <Route path={WebPage.MOCK_SINGPASS_AUTHCALLBACK} element={<MockAuthCallback />} />
          <Route path={WebPage.MOCK_CORPPASS_AUTHCALLBACK} element={<MockAuthCallback isCorppass={true} />} />
          <Route path={WebPage.SINGPASS_AUTHCALLBACK} element={<AuthCallback />} />
          <Route path={WebPage.CORPPASS_AUTHCALLBACK} element={<AuthCallback isCorppass={true} />} />
          <Route path={WebPage.ICA_SSO_CALLBACK} element={<IcaSsoCallback />} />

          {/* Wildcard (Anything else) route */}
          <Route path="*" element={<NotFoundError />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
