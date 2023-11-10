import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { FileSpinner, Props } from '.';

const mockProps: Props = {
  children: 'test string',
};

describe('FileSpinner', () => {
  it('should render child text when available', async () => {
    render(<FileSpinner {...mockProps} />);
    const component = screen.getByTestId(TEST_IDS.FILE_SPINNER);
    expect(component.textContent).toBe('test string');
  });
});
