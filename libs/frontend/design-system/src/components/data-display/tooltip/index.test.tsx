import userEvent from '@testing-library/user-event';

import { TEST_IDS } from '../../../utils/constants';
import { render, screen, waitFor } from '../../../utils/test-utils';
import { Props, Tooltip } from '.';

const mockProps: Props = { identifier: 'example-tooltip', content: 'tooltip message' };
describe('Tooltip', () => {
  it('should display content when hovered over', async () => {
    render(<Tooltip {...mockProps} />);
    const iconComponent = screen.getByTestId(TEST_IDS.ICON);
    userEvent.hover(iconComponent);

    await waitFor(() => {
      expect(screen.getByRole('tooltip', { name: 'tooltip message', hidden: true })).toBeVisible();
    });
  });
});
