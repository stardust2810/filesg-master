import { renderComponent } from '../../../utils/testing/test-utils';
import Dashboard from '.';

describe('Dashboard/Home page', () => {
  it('should render', async () => {
    renderComponent(<Dashboard />, {});

    // const pageDescriptor = screen.findAllByTestId(TEST_IDS.PAGE_DESCRIPTOR);

    // expect(pageDescriptor).toBeInTheDocument();
  });
});
