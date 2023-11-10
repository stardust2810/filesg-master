import { TEST_IDS } from '../../../utils/constants';
import { fireEvent,render, screen } from '../../../utils/test-utils';
import { Props,TextButton } from '.';

const mockClick = jest.fn()

const mockProps: Props = {
  label: 'Test Label',
  startIcon: 'fsg-icon-circle-check',
  onClick: mockClick,
};

describe('Renders Text Button component', () => {

  it('Test if Text Button, icon & text components renders', async () => {
    render(<TextButton {...mockProps} />)

    const textButtonComponent = screen.getByTestId(TEST_IDS.TEXT_BUTTON);
    const iconComponent = screen.getByTestId(TEST_IDS.ICON)
    const textComponent = screen.getByTestId(TEST_IDS.TEXT);

    expect(textButtonComponent).toBeInTheDocument();
    expect(iconComponent).toBeInTheDocument();
    expect(textComponent).toBeInTheDocument();
  });


  it('Tests if button label matches', async () => {
    render(<TextButton {...mockProps} />)
    const textComponent = screen.getByTestId(TEST_IDS.TEXT);

    expect(textComponent.textContent).toEqual(mockProps.label);
  });

  it('Tests if button handles click', async () => {
    render(<TextButton {...mockProps} />)
    const textButtonComponent = screen.getByTestId(TEST_IDS.TEXT_BUTTON);

    fireEvent.click(textButtonComponent);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
    mockClick.mockClear()
  });

  it('Test if button is able to be disabled', async () => {
    render(<TextButton disabled {...mockProps} />)
    const textButtonComponent = screen.getByTestId(TEST_IDS.TEXT_BUTTON);
    expect(textButtonComponent).toBeDisabled();

    fireEvent.click(textButtonComponent);
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });
});
