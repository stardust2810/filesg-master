import { screen } from '@testing-library/react';

import { renderComponent } from '../../../../../utils/testing/test-utils';
import { VERIFICATION_RESULT_MESSAGE,VerificationResultMessage } from '.';

const FSG_ICON_CIRCLE_CHECK = 'fsg-icon-circle-check';
const FSG_ICON_CIRCLE_CROSS = 'fsg-icon-circle-cross';

describe('VerificationResultMessage', () => {
  it('should render given text and check icon when isSuccess is true ', async () => {
    renderComponent(<VerificationResultMessage status="SUCCESS" text="success" />, {});

    const iconImg = await screen.findByTestId(`${VERIFICATION_RESULT_MESSAGE}-icon`);
    const messageText = await screen.findByText(/success/i);

    expect(iconImg).toHaveClass(FSG_ICON_CIRCLE_CHECK);
    expect(messageText).toBeInTheDocument();
  });

  it('should render given text and cross icon when status is failure ', async () => {
    renderComponent(<VerificationResultMessage status="FAILURE" text="failure" />, {});

    const iconImg = await screen.findByTestId(`${VERIFICATION_RESULT_MESSAGE}-icon`);
    const messageText = await screen.findByText(/failure/i);

    expect(iconImg).toHaveClass(FSG_ICON_CIRCLE_CROSS);
    expect(messageText).toBeInTheDocument();
  });
});
