import { useUserAgent } from '@filesg/design-system';
import { useCallback, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useLocation, useNavigate } from 'react-router-dom';

import { WebPage } from '../../consts';
import { BROWSER, SUPPORTED_BROWSERS } from '../../typings/browser';

const USER_AGENT_CHECKED_COOKIE = 'user-agent-checked';

const SAFARI_MINIMUM_SUPPORTED_VERSION = 15;
const CHROME_MINIMUM_SUPPORTED_VERSION = 110;
const EDGE_MINIMUM_SUPPORTED_VERSION = 110;
const FIREFOX_MINIMUM_SUPPORTED_VERSION = 110;

export const useUserAgentCheck = () => {
  const [cookies, setCookies] = useCookies();
  const hasCheckedUserAgent = Object.keys(cookies).includes(USER_AGENT_CHECKED_COOKIE);
  const { browserName, parsedBrowserMajorVersion } = useUserAgent();
  const navigate = useNavigate();
  const location = useLocation();

  const markUserAgentAsChecked = useCallback(() => {
    setCookies(USER_AGENT_CHECKED_COOKIE, true, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }, [setCookies]);

  const isBrowserVersionSupported = (browserName: BROWSER | string, parsedBrowserMajorVersion: number | undefined) => {
    if (parsedBrowserMajorVersion === undefined) {
      return false;
    }
    switch (browserName) {
      case BROWSER.MOBILE_SAFARI:
      case BROWSER.SAFARI:
        return parsedBrowserMajorVersion >= SAFARI_MINIMUM_SUPPORTED_VERSION;
      case BROWSER.FIREFOX:
        return parsedBrowserMajorVersion >= FIREFOX_MINIMUM_SUPPORTED_VERSION;
      case BROWSER.CHROME:
      case BROWSER.CHROME_HEADLESS:
        return parsedBrowserMajorVersion >= CHROME_MINIMUM_SUPPORTED_VERSION;
      case BROWSER.EDGE:
        return parsedBrowserMajorVersion >= EDGE_MINIMUM_SUPPORTED_VERSION;

      default:
        return false;
    }
  };

  useEffect(() => {
    // Not proceeding to do anything if user agent was recently check
    // OR when user is at /ica-sso-callback - to prevent token expiration
    if (hasCheckedUserAgent || location.pathname === WebPage.ICA_SSO_CALLBACK) {
      return;
    }

    // No matter what is the user's action, mark as checked
    markUserAgentAsChecked();

    if (
      browserName &&
      SUPPORTED_BROWSERS.includes(browserName as BROWSER) &&
      isBrowserVersionSupported(browserName, parsedBrowserMajorVersion)
    ) {
      return;
    }
    navigate(WebPage.BROWSER_NOT_SUPPORTED);
  }, [location, browserName, navigate, hasCheckedUserAgent, markUserAgentAsChecked, parsedBrowserMajorVersion]);
};
