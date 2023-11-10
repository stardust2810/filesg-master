import { MemoryRouter } from 'react-router-dom';
import { ListItem, IListItem } from '.';
import { TEST_IDS } from '../../../../../utils/constants';
import { fireEvent, render, screen } from '../../../../../utils/test-utils';

const mockNavItemProps: IListItem = {
  isNested: false,
  expandableProps: {
    isExpandable: true,
    isExpanded: true,
    onExpandBtnClick: jest.fn(),
    onLabelClick: jest.fn(),
  },
  to: '/1',
  label: 'yo',
};
const mockActionItemProps: IListItem = {
  isNested: true,
  expandableProps: {
    isExpandable: false,
    isExpanded: true,
    onExpandBtnClick: jest.fn(),
    onLabelClick: jest.fn(),
  },
  onClick: jest.fn(),
  label: 'yo',
};

describe('List Item', () => {
  it(`should be an anchor tag if 'to' prop is available`, () => {
    render(
      <MemoryRouter>
        <ListItem {...mockNavItemProps} />
      </MemoryRouter>,
    );

    const expandableItemComponent = screen.getByTestId(TEST_IDS.LIST_NAVIGATION_ITEM);
    expect(expandableItemComponent).toBeInTheDocument();
    expect(expandableItemComponent.textContent).toBe('yo');

    expect(expandableItemComponent).toHaveAttribute('href', '/1');
    const iconBtnComponent = screen.getByTestId(TEST_IDS.ICON_BUTTON);

    expect(iconBtnComponent).toBeInTheDocument();
    fireEvent.click(iconBtnComponent);
    expect(mockNavItemProps.expandableProps?.onExpandBtnClick).toHaveBeenCalledTimes(1);
  });

  it(`should be a button if 'onClick' prop is available`, () => {
    render(<ListItem {...mockActionItemProps} />);

    const expandableItemComponent = screen.getByTestId(TEST_IDS.LIST_ACTION_ITEM);
    expect(expandableItemComponent).toBeInTheDocument();
    expect(expandableItemComponent.textContent).toBe('yo');

    fireEvent.click(expandableItemComponent);
    expect(mockActionItemProps.onClick).toHaveBeenCalledTimes(1);
  });

  it(`should apply nested styling if component is nested`, () => {
    render(<ListItem {...mockActionItemProps} />);

    const expandableItemComponent = screen.getByTestId(TEST_IDS.LIST_ACTION_ITEM);
    expect(expandableItemComponent).toBeInTheDocument();
    expect(expandableItemComponent).toHaveStyle({ height: '2.25rem' });

    fireEvent.mouseOver(expandableItemComponent);

    expect(expandableItemComponent).toHaveStyle({ backgroundColor: 'inherit' });
  });
});
