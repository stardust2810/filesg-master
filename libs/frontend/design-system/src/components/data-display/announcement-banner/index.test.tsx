import { PropsWithChildren } from 'react';

import { TEST_IDS } from '../../../utils/constants';
import { render, screen, testIfComponentShouldRender } from '../../../utils/test-utils';
import { AnnouncementBanner, Props } from '.';

const propsWithoutOnClose: PropsWithChildren<Props> = {
  type: 'TECHNICAL',
  title: 'Test Title',
  description: 'Test Description',
  onClose: undefined,
};
const component = (props) => <AnnouncementBanner {...props} />;
describe('AnnouncementBanner', () => {
  it('should render correct title', () => {
    render(<AnnouncementBanner {...propsWithoutOnClose} />);
    const announcementBannerTitleComponent = screen.getByTestId(TEST_IDS.ANNOUNCEMENT_BANNER_TITLE);
    expect(announcementBannerTitleComponent.textContent).toEqual(propsWithoutOnClose.title);
  });

  it('should render correct description', () => {
    render(<AnnouncementBanner {...propsWithoutOnClose} />);
    const announcementBannerDescriptionComponent = screen.getByTestId(TEST_IDS.ANNOUNCEMENT_BANNER_DESCRIPTION);
    expect(announcementBannerDescriptionComponent.textContent).toEqual(propsWithoutOnClose.description);
  });

  testIfComponentShouldRender(component(propsWithoutOnClose), false, 'close button', TEST_IDS.ANNOUNCEMENT_BANNER_CLOSE_BUTTON);

  testIfComponentShouldRender(
    component({
      ...propsWithoutOnClose,
      onClose: () => {
        // no op
      },
    }),
    true,
    'close button',
    TEST_IDS.ANNOUNCEMENT_BANNER_CLOSE_BUTTON,
  );
});
