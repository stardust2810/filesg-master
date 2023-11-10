import { Color, FileSGThemes } from '../../..';
import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Icon, Props } from '.';

const mockProps: Props & Required<Pick<Props, 'size'>> = {
  icon: 'fsg-icon-loading',
  size: 'ICON_LARGE',
  color: Color.BLACK,
};

describe('Icon component', () => {
  it('should renders with correct dimensions according to props', () => {
    render(<Icon {...mockProps} />);
    const { size } = mockProps;
    const iconComponent = screen.getByTestId(TEST_IDS.ICON);

    expect(iconComponent).toHaveStyle(`font-size: ${FileSGThemes[0].FSG_FONT[size].SIZE}`);
    expect(iconComponent).toHaveStyle(`height: ${FileSGThemes[0].FSG_FONT[size].SIZE}`);
    expect(iconComponent).toHaveStyle(`width: ${FileSGThemes[0].FSG_FONT[size].SIZE}`);
  });

  // TODO: test for color
  // it('should render given color', () => {
  //   render(<Icon {...mockProps} />);
  //   const { getComputedStyle } = window;

  //   const iconPsuedoElement = getComputedStyle(document.querySelector(`span`)!, ':before');
  //   console.log(iconPsuedoElement);
  //   expect(iconPsuedoElement).toBe(Color.BLACK);
  // });

  it('should render correct class', () => {
    render(<Icon {...mockProps} />);
    const iconComponent = screen.getByTestId(TEST_IDS.ICON);

    expect(iconComponent).toHaveClass('fsg-icon-loading', 'fsg-icon');
  });
});
