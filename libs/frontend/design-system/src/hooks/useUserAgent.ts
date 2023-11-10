import { UAParser } from 'ua-parser-js';

interface BrowserUserAgent {
  browserName: string | undefined;
  browserVersion: string | undefined;
  parsedBrowserMajorVersion: number | undefined;
}
export const useUserAgent = (): BrowserUserAgent => {
  const parser = new UAParser();
  const {
    browser: { name: browserName, version: browserVersion },
  } = parser.getResult();

  // set parsedBrowserMajorVersion to undefined if it is NaN
  const parsedBrowserMajorVersion = Number.isNaN(parseInt(browserVersion!)) ? undefined : parseInt(browserVersion!, 10);

  return { browserName, browserVersion, parsedBrowserMajorVersion };
};
