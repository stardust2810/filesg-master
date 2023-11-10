import { MemoryRouter as Router } from 'react-router-dom';

import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Footer, Props } from '.';

const TEST_COLOR = '#14405D';
const TEST_LABEL = 'Verify'; // first item of sitemap
const TEST_URL = '/1'; // first item of sitemap

const mockProps: Props = {
  title: 'Test Title',
  description: 'Test Description',
  footerBackgrdColor: TEST_COLOR,
  topSectionLinks: [
    {
      label: TEST_LABEL,
      to: TEST_URL,
    },
    {
      label: TEST_LABEL,
      to: TEST_URL,
    },
  ],
  bottomSectionLinks: [
    {
      label: TEST_LABEL,
      to: TEST_URL,
      external: true,
    },
    {
      label: TEST_LABEL,
      to: TEST_URL,
    },
    {
      label: TEST_LABEL,
      to: TEST_URL,
    },
  ],
  updatedDate: new Date('12 Nov 2021'),
};

describe('Footer component renders', () => {
  let testComponent: HTMLElement;

  beforeEach(async () => {
    render(
      <Router>
        <Footer {...mockProps} />
      </Router>,
    );
    testComponent = await screen.findByTestId(TEST_IDS.FOOTER);
  });

  it('should render correct background color', () => {
    expect(testComponent).toHaveStyle({ backgroundColor: TEST_COLOR });
  });

  it('should display the correct title', async () => {
    const textComponent = await screen.findAllByTestId(TEST_IDS.TEXT);

    expect(textComponent[0].textContent).toEqual(mockProps.title);
  });

  it('should display the correct description', async () => {
    const textComponent = await screen.findAllByTestId(TEST_IDS.TEXT);

    expect(textComponent[1].textContent).toEqual(mockProps.description);
  });

  it('top section has correct number of links', () => {
    const linksUlComponent = testComponent.querySelectorAll('ul')[0];
    expect(linksUlComponent.children.length).toEqual(mockProps.topSectionLinks.length);
  });

  it('bottom section has correct number of links', async () => {
    const bottomSection = testComponent.querySelectorAll('ul')[1];

    const links = bottomSection.querySelectorAll('li');
    expect(links.length).toEqual(mockProps.bottomSectionLinks.length);
  });

  it('links display the correct label', () => {
    const linksComponent = testComponent.querySelectorAll('ul')[0];
    expect(linksComponent.firstChild?.textContent).toContain(TEST_LABEL);
  });

  it('links link to correct URL', () => {
    const linkComponent = testComponent.querySelectorAll('ul')[0].firstChild;
    expect(linkComponent?.firstChild).toHaveAttribute('href', TEST_URL);
  });

  it('external links to display icon', async () => {
    const bottomSection = testComponent.querySelectorAll('ul')[1];

    const externalLinkComponent = bottomSection.firstChild;
    const iconComponent = await screen.findByTestId(TEST_IDS.ICON);

    expect(externalLinkComponent).toContainElement(iconComponent);
  });
});
