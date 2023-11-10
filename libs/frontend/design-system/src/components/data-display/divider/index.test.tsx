import { Color } from '../../../styles/color';
import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Divider } from '.';

describe('Divider component', () => {
  it('should render correctly', async () => {
    render(<Divider />);
    const dividerComponent = await screen.getByTestId(TEST_IDS.DIVIDER);

    expect(dividerComponent).toBeInTheDocument();
    expect(dividerComponent).toHaveStyle(`border-top: 1px solid ${Color.GREY30}`);
  });
});
