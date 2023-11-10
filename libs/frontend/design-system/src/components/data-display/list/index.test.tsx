import { MemoryRouter } from 'react-router-dom';

import { TEST_IDS } from '../../../utils/constants';
import { fireEvent, render, screen } from '../../../utils/test-utils';
import { List, Props } from './index';

const TEST_NESTED_NAV_LINK_ID = 'filesg-list-item-1-nested-0-link-2-child';

const mockProps: Props = {
  defaultExpandAll: false,
  items: [
    {
      label: 'Link 1',
      to: '/',
    },
    {
      label: 'Link 2',
      to: '/2',
      dropdowns: [
        {
          label: 'Link 2 child',
          to: '/2',
          icon: 'sgds-icon-file-alt',
        },
        {
          label: 'Action 1',
          icon: 'sgds-icon-file-alt',
          onClick: () => {
            //no op
          },
        },
      ],
    },
    {
      label: 'Action 2',
      onClick: () => {
        //no op
      },
    },
  ],
};

describe('List', () => {
  describe(`When defaultExpandAll is false`, () => {
    it(`expandable list should only show when list is expanded`, () => {
      render(
        <MemoryRouter>
          <List {...mockProps} />
        </MemoryRouter>,
      );
      let content = screen.queryByTestId(TEST_NESTED_NAV_LINK_ID);

      expect(content).not.toBeInTheDocument();

      const buttonComponent = screen.getByTestId(TEST_IDS.ICON_BUTTON);
      fireEvent.click(buttonComponent);
      content = screen.queryByTestId(TEST_NESTED_NAV_LINK_ID);

      expect(content).toBeInTheDocument();
    });
  });

  describe(`When defaultExpandAll is true`, () => {
    it(`expandable list should show by default`, () => {
      render(
        <MemoryRouter>
          <List {...mockProps} defaultExpandAll={true} />
        </MemoryRouter>,
      );
      let content = screen.queryByTestId(TEST_NESTED_NAV_LINK_ID);

      expect(content).toBeInTheDocument();

      const buttonComponent = screen.getByTestId(TEST_IDS.ICON_BUTTON);
      fireEvent.click(buttonComponent);
      content = screen.queryByTestId(TEST_NESTED_NAV_LINK_ID);

      expect(content).not.toBeInTheDocument();
    });
  });
});
