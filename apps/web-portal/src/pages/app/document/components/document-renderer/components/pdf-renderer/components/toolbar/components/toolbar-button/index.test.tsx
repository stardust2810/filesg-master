import { screen } from '@testing-library/react';

import { renderComponent } from '../../../../../../../../../../../utils/testing/test-utils';
import { BUTTON_TYPE, Props, TEST_ID, ToolbarButton } from '.';

const TEST_PROPS: Props = {
  type: BUTTON_TYPE.ZOOM_IN,
  onClick: jest.fn(),
  disabled: false,
};

describe('ToolbarButton', () => {
  it('should render button', async () => {
    renderComponent(<ToolbarButton type={TEST_PROPS.type} onClick={TEST_PROPS.onClick} disabled={TEST_PROPS.disabled} />, {});

    const elememts = await screen.findAllByTestId(`${TEST_ID.BUTTON}-${TEST_PROPS.type}`);
    for (let x = 0; x < elememts.length; x++) {
      expect(elememts[x]).toBeInTheDocument();
    }
  });

  it('should display icon when given icon prop', async () => {
    renderComponent(<ToolbarButton type={TEST_PROPS.type} onClick={TEST_PROPS.onClick} disabled={TEST_PROPS.disabled} />, {});

    const elememts = await screen.findAllByTestId(`${TEST_ID.ICON}-${TEST_PROPS.type}`);
    for (let x = 0; x < elememts.length; x++) {
      expect(elememts[x]).toBeInTheDocument();
    }
  });
});
