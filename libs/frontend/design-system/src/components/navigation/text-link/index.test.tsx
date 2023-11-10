import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '../../../utils/test-utils';
import { Props,TextLink } from '.';

const mockProps: Props = {
  type: 'LINK',
  font: 'BODY',
  to: '/',
};

describe('Text Link Component', () => {
  it('should render', async () => {
    render(
      <MemoryRouter>
        <TextLink {...mockProps} />
      </MemoryRouter>,
      {},
    );

    const textLink = await screen.getByTestId('text-link');

    expect(textLink).toBeInTheDocument();
  });
});
