import userEvent from '@testing-library/user-event';

import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Breadcrumb, Props } from '.';

const mockedItems = [
  { label: 'Page-1', to: '/page-1' },
  { label: 'Page-2', to: '/page-2' },
  { label: 'Page-3', to: '/page-3' },
];

const collapse = {
  itemsBefore: 0,
  itemsAfter: 2,
};

const mockProps: Props = {
  items: mockedItems,
  separator: '/',
  reverse: true,
};

describe('Breadcrumb', () => {
  it('should render the correct amount of items and labels', () => {
    render(<Breadcrumb {...mockProps} />);
    const separators = screen.getAllByTestId(TEST_IDS.BREADCRUMB_SEPARATOR);
    for (let x = 0; x < mockedItems.length; x++) {
      const item = screen.getByTestId(`${TEST_IDS.BREADCRUMB_ITEM}-${x}`);
      const href = item.getElementsByTagName('a')[0];
      expect(href.textContent).toEqual(mockedItems[x].label);
    }

    for (const item of mockedItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }

    expect(separators.length).toEqual(4);
  });

  it('should be collapsible initally, and expandable upon clicking on the collapsor', () => {
    render(<Breadcrumb collapse={collapse} {...mockProps} />);
    const collapser = screen.getByTestId(TEST_IDS.BREADCRUMB_COLLAPSOR);
    for (let x = 1; x < mockedItems.length; x++) {
      const item = screen.getByTestId(`${TEST_IDS.BREADCRUMB_ITEM}-${x}`);
      const href = item.getElementsByTagName('a')[0];
      expect(href.textContent).toEqual(mockedItems[x].label);
    }

    expect(collapser).toBeInTheDocument();
    userEvent.click(collapser);

    for (let x = 0; x < mockedItems.length; x++) {
      const item = screen.getByTestId(`${TEST_IDS.BREADCRUMB_ITEM}-${x}`);
      const href = item.getElementsByTagName('a')[0];
      expect(href.textContent).toEqual(mockedItems[x].label);
    }
  });
});
