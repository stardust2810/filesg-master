import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Alert, Props } from '.';

const mockProps: Props = {
  children: 'Test Text',
  variant: 'DANGER',
  block: true,
};

describe('Alert', () => {
  it('should render icon label', async () => {
    render(<Alert {...mockProps} />);
    const component = screen.getByTestId(TEST_IDS.ALERT);
    const iconLabelComponent = screen.getByTestId(TEST_IDS.ICON_LABEL);
    const textComponent = screen.getByTestId(TEST_IDS.TEXT);

    expect(component).toBeInTheDocument();
    expect(iconLabelComponent).toBeInTheDocument();
    expect(textComponent).toBeInTheDocument();
  });

  it('should render text as passed in', async () => {
    render(<Alert {...mockProps} />);
    const textComponent = screen.getByTestId(TEST_IDS.TEXT);
    expect(textComponent.textContent).toEqual(mockProps.children);
  });
});
