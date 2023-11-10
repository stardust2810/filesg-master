import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Avatar, Props } from '.';

const mockProps: Props = {
  imageUrl: 'random url',
  alt: 'random alt',
};

describe('Avatar', () => {
  it('should render image with alt', () => {
    render(<Avatar {...mockProps} />);
    const component = screen.getByTestId(TEST_IDS.AVATAR_IMAGE);

    expect(component).toHaveAttribute('src', mockProps.imageUrl);
    expect(component).toHaveAttribute('alt', mockProps.alt);
  });
});
