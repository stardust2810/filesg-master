import { MemoryRouter } from 'react-router-dom';

import { TEST_IDS } from '../../../utils/constants';
import { testIfComponentShouldRender } from '../../../utils/test-utils';
import { AppHeader, Props } from '.';

const NORMAL_TABLET_LANDSCAPE_WIDTH = 1024;

const TEST_NAV_LINK_LOCATOR = TEST_IDS.HEADER_NAV_LINK + '-0';
const TEST_UNCOLLAPSIBLE_BTN_LOCATOR = TEST_IDS.HEADER_ACTION_BUTTON + '-button';
const TEST_COLLAPSIBLE_BTN_LOCATOR = TEST_IDS.HEADER_ACTION_BUTTON + '-user-profile';

const testHandler = () => {
  // For test
};
const mockProps: Props = {
  onLogoClick: '/',
  navItems: [
    { label: 'Link 1', to: '/' },
    { label: 'Link 2', to: '/2' },
    { label: 'Link 3', to: '/3' },
  ],
  uncollapsibleActionItems: [
    {
      label: 'Button label',
      onClick: testHandler,
      testLocatorName: 'button',
    },
  ],
  collapsibleActionItems: [
    {
      icon: 'sgds-icon-person',
      onClick: () => {
        //noop
      },
      testLocatorName: 'user-profile',
    },
  ],
};

describe('AppHeader', () => {
  const component = (props) => (
    <MemoryRouter>
      <AppHeader {...props} />
    </MemoryRouter>
  );
  const menuBtn = 'menu button';
  describe(`When viewport is < ${NORMAL_TABLET_LANDSCAPE_WIDTH}`, () => {
    beforeEach(() => {
      global.innerWidth = NORMAL_TABLET_LANDSCAPE_WIDTH - 1;
    });

    testIfComponentShouldRender(component(mockProps), false, 'nav link', TEST_NAV_LINK_LOCATOR);
    testIfComponentShouldRender(component(mockProps), true, menuBtn, TEST_IDS.HEADER_MENU_BUTTON);
    testIfComponentShouldRender(component({ onLogoClick: '/' }), false, menuBtn, TEST_IDS.HEADER_MENU_BUTTON, 'no items');
    testIfComponentShouldRender(
      component({
        onLogoClick: '/',
        forceShowMenuBtn: true,
      }),
      true,
      menuBtn,
      TEST_IDS.HEADER_MENU_BUTTON,
      'no items but forceShow is true',
    );
    testIfComponentShouldRender(component(mockProps), true, 'uncollapsible item', TEST_UNCOLLAPSIBLE_BTN_LOCATOR);
    testIfComponentShouldRender(component(mockProps), false, 'collapsible item', TEST_COLLAPSIBLE_BTN_LOCATOR);
  });

  describe(`When viewport is >= ${NORMAL_TABLET_LANDSCAPE_WIDTH}`, () => {
    beforeEach(() => {
      global.innerWidth = NORMAL_TABLET_LANDSCAPE_WIDTH;
    });

    testIfComponentShouldRender(component(mockProps), true, 'nav link', TEST_NAV_LINK_LOCATOR);
    testIfComponentShouldRender(component(mockProps), false, menuBtn, TEST_IDS.HEADER_MENU_BUTTON);
    testIfComponentShouldRender(
      component({
        ...mockProps,
        forceShowMenuBtn: true,
      }),
      false,
      menuBtn,
      TEST_IDS.HEADER_MENU_BUTTON,
      'forceShow is true',
    );
    testIfComponentShouldRender(component(mockProps), true, 'uncollapsible item', TEST_UNCOLLAPSIBLE_BTN_LOCATOR);
    testIfComponentShouldRender(component(mockProps), true, 'collapsible item', TEST_COLLAPSIBLE_BTN_LOCATOR);
  });
});
