import { MemoryRouter } from 'react-router-dom';

import { ListExpandableItem, Props } from '.';
import { render, screen } from '../../../../../utils/test-utils';

const mockProps: Props = {
  defaultExpandAll: false,
  item: {
    label: 'Link 2',
    to: '/2',
  },
};

describe('List Expandable Item', () => {
  it(`expandable list should show by default`, () => {
    render(
      <MemoryRouter>
        <ListExpandableItem defaultExpandAll={mockProps.defaultExpandAll} item={mockProps.item} data-testid="expandable-item-test">
          <div>testing 123</div>
        </ListExpandableItem>
      </MemoryRouter>,
    );

    const expandableItemComponent = screen.getByTestId('expandable-item-test');
    const content = screen.queryByText('testing 123');
    expect(expandableItemComponent).toBeInTheDocument();
    expect(content).not.toBeInTheDocument();
  });
});
