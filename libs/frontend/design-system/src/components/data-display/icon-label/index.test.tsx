import { Color } from '../../../styles/color';
import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { IconLabel, Props } from '.';

const mockProps: Props = {
  icon: 'fsg-icon-circle-check-solid',
  iconBackgroundColor: Color.BLACK,
  iconColor: Color.BLACK,
  iconSize: 'ICON_LARGE',
  title: 'Test Title',
  description: 'Text Description',
};

describe('Icon Label component', () => {
  it('should render icon & text components', () => {
    render(<IconLabel {...mockProps} />);

    const iconLabelComponent = screen.getByTestId(TEST_IDS.ICON_LABEL);
    const iconComponent = screen.getByTestId(TEST_IDS.ICON);
    const textComponents = screen.getAllByTestId(TEST_IDS.TEXT);

    expect(iconLabelComponent).toBeInTheDocument();
    expect(iconComponent).toBeInTheDocument();
    expect(textComponents.length).toEqual(2);
  });

  it('should render title & description as per given props', () => {
    render(<IconLabel {...mockProps} />);
    const textComponents = screen.getAllByTestId(TEST_IDS.TEXT);

    expect(textComponents[0].textContent).toEqual(mockProps.title);
    expect(textComponents[1].textContent).toEqual(mockProps.description);
  });

  const mockPropsWithElementTitleAndDesc: Props = {
    icon: 'fsg-icon-circle-check-solid',
    iconBackgroundColor: Color.BLACK,
    iconColor: Color.BLACK,
    iconSize: 'ICON_LARGE',
    title: <div data-testid="test-title">Test title</div>,
    description: <div data-testid="test-description">Test description</div>,
  };

  it('should not have text component', () => {
    render(<IconLabel {...mockPropsWithElementTitleAndDesc} />);
    const textComponents = screen.queryAllByTestId(TEST_IDS.TEXT);

    expect(textComponents).toHaveLength(0);
    const titleComponent = screen.getByText('Test title');
    expect(titleComponent).toBeInTheDocument();
    const descComponent = screen.getByText('Test description');
    expect(descComponent).toBeInTheDocument();
  });
});
