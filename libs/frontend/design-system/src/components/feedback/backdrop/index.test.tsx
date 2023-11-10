import { Color } from '../../../styles/color';
import { HEX_COLOR_OPACITY, TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Backdrop, Props } from '.';

const mockProps: Props = {
  invisible: true,
};

describe('Backdrop', () => {
  it('should not be visible', async () => {
    render(<Backdrop {...mockProps} />);
    const component = screen.getByTestId(TEST_IDS.BACKDROP);
    expect(component).toHaveStyle({ background: 'transparent' });
  });
  it('should be visible', async () => {
    render(<Backdrop {...mockProps} invisible={false} />);
    const component = screen.getByTestId(TEST_IDS.BACKDROP);
    expect(component).toHaveStyle({ background: Color.GREY80 + HEX_COLOR_OPACITY.P60 });
  });
});
