import { TEST_IDS } from '../../../utils/constants';
import { fireEvent, render, screen } from '../../../utils/test-utils';
import { IconButton, Props } from '.';

const mockClick = jest.fn();

const mockProps: Props = {
  decoration: 'SOLID',
  color: 'PRIMARY',
  size: 'NORMAL',
  block: true,
  icon: 'fsg-icon-circle-warning-solid',
  onClick: mockClick,
};

describe('Renders Icon Button component', () => {
  it('Tests if button and icons renders', () => {
    render(<IconButton {...mockProps} />);
    const iconButtonComponent = screen.getByTestId(TEST_IDS.ICON_BUTTON);
    const iconComponent = screen.getByTestId(TEST_IDS.ICON);

    expect(iconButtonComponent).toBeInTheDocument();
    expect(iconComponent).toBeInTheDocument();
  });

  it('Tests if button handles click', () => {
    render(<IconButton {...mockProps} />);
    const iconButtonComponent = screen.getByTestId(TEST_IDS.ICON_BUTTON);

    fireEvent.click(iconButtonComponent);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
    mockClick.mockClear();
  });

  it('Tests if button is able to be disabled', () => {
    render(<IconButton disabled {...mockProps} />);
    const iconButtonComponent = screen.getByTestId(TEST_IDS.ICON_BUTTON);
    expect(iconButtonComponent).toBeDisabled();

    fireEvent.click(iconButtonComponent);
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });
});
