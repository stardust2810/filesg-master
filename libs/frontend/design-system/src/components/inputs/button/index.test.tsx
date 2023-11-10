import { TEST_IDS } from '../../../utils/constants';
import { fireEvent, render, screen } from '../../../utils/test-utils';
import { Button, Props } from '.';
// import '@testing-library/jest-dom';

const mockClick = jest.fn();

const mockProps: Props = {
  label: 'Button label',
  decoration: 'SOLID',
  color: 'PRIMARY',
  size: 'NORMAL',
  fullWidth: true,
  startIcon: 'sgds-icon-add-image',
  endIcon: 'fsg-icon-loading',
  onClick: mockClick,
};

describe('Render Button component', () => {
  it('Tests if button and icons components renders', () => {
    render(<Button {...mockProps} />);

    const buttonComponent = screen.getByTestId(TEST_IDS.BUTTON).children[0];
    const iconComponents = screen.getAllByTestId(TEST_IDS.ICON);

    expect(buttonComponent).toBeInTheDocument();
    expect(buttonComponent.firstChild).toEqual(iconComponents[0]);
    expect(buttonComponent.lastChild).toEqual(iconComponents[1]);
  });

  it('Tests if button label matches', () => {
    render(<Button {...mockProps} />);
    const buttonComponent = screen.getByTestId(TEST_IDS.BUTTON).children[0];
    expect(buttonComponent.children[1].textContent).toEqual(mockProps.label);
  });

  it('Tests if button handles click', () => {
    render(<Button {...mockProps} />);
    const buttonComponent = screen.getByTestId(TEST_IDS.BUTTON);

    fireEvent.click(buttonComponent);
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
    mockClick.mockClear();
  });

  it('Tests if button is able to be disabled', () => {
    render(<Button disabled {...mockProps} />);
    const buttonComponent = screen.getByTestId(TEST_IDS.BUTTON);
    expect(buttonComponent).toBeDisabled();

    fireEvent.click(buttonComponent);
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  // it('Test if focus adds box shadow', async () => {
  //   render(renderComponent());
  //   const buttonComponent = await screen.getByTestId(TEST_ID);

  //   buttonComponent.focus();
  //   expect(buttonComponent).toHaveFocus;
  //   expect(buttonComponent).toHaveStyle(`
  //     box-shadow: 0 0 0 2pt rgba(55, 44, 209, 0.25);
  //   `);
  // });

  // it('Tests if hover changes the button color', async () => {
  //   render(renderComponent());
  //   const buttonComponent = await screen.getByTestId(TEST_ID);

  //   fireEvent.mouseOver(buttonComponent);
  //   expect(buttonComponent).toHaveStyle({
  //     'background-color': Color.PURPLE_DARKER,
  //   });
  // });
});
