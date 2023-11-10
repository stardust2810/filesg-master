import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { FileSGLogo, Props } from '.';

const mockProps: Props = {};
describe('FileSGLogo component', () => {
  beforeEach(() => {
    render(<FileSGLogo {...mockProps} />);
  });

  it('should render file logo with alt text', () => {
    const component = screen.getByTestId(TEST_IDS.FILESG_APP_LOGO);
    expect(component).toBeInTheDocument();
    expect(component).toHaveAccessibleName('FileSG logo');
  });
});
