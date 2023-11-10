import React from 'react';

import { TEST_IDS } from '../../../utils/constants';
import { render, screen } from '../../../utils/test-utils';
import { Dropzone, Props } from '.';

const mockProps: Props = {
  buttonLabel: 'Select file',
  description: 'or drop file here',
};

describe('Render Dropzone Component', () => {
  it('should render button and description when props given', () => {
    render(<Dropzone {...mockProps} />);
    const buttonComponent = screen.getByTestId(TEST_IDS.BUTTON);
    const descriptionComponent = screen.getByTestId(TEST_IDS.FILE_UPLOAD_DROPZONE_DESCRIPTION);

    expect(buttonComponent).toBeInTheDocument();
    expect(buttonComponent.textContent).toEqual(mockProps.buttonLabel);

    expect(descriptionComponent).toBeInTheDocument();
    expect(descriptionComponent.textContent).toEqual(mockProps.description);
  });
});
