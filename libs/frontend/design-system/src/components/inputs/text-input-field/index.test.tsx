import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Props, TextInputField } from '.';

const mockProps: Props = {
  errorMessage: 'testError',
  successMessage: 'testSuccess',
};

describe('Text Input', () => {
  it('should render input & icon labels', async () => {
    render(<TextInputField {...mockProps} />);

    const textInputContainer = screen.getByTestId(TEST_IDS.TEXT_INPUT_CONTAINER);
    const textInput = screen.getByTestId(TEST_IDS.TEXT_INPUT);
    const textInputErrorPrompt = screen.getByTestId(TEST_IDS.TEXT_INPUT_ERROR_PROMPT);
    const textInputSuccessPrompt = screen.getByTestId(TEST_IDS.TEXT_INPUT_SUCCESS_PROMPT);

    expect(textInputContainer).toBeInTheDocument();
    expect(textInput).toBeInTheDocument();
    expect(textInputErrorPrompt).toBeInTheDocument();
    expect(textInputSuccessPrompt).toBeInTheDocument();
  });

  it('should render the correct messages', async () => {
    render(<TextInputField {...mockProps} />);
    const textInputErrorPrompt = screen.getByTestId(TEST_IDS.TEXT_INPUT_ERROR_PROMPT);
    const textInputSuccessPrompt = screen.getByTestId(TEST_IDS.TEXT_INPUT_SUCCESS_PROMPT);

    expect(textInputErrorPrompt.textContent).toEqual(mockProps.errorMessage);
    expect(textInputSuccessPrompt.textContent).toEqual(mockProps.successMessage);
  });

  it('should be in disabled state when disabled prop is passed', async () => {
    render(<TextInputField disabled {...mockProps} />);
    const textInput = screen.getByTestId(TEST_IDS.TEXT_INPUT);
    expect(textInput).toBeDisabled();
  });
});
