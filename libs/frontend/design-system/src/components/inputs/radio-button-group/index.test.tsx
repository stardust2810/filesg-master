import React, { SetStateAction, useState } from 'react';

import { TEST_IDS } from '../../../utils/constants';
import { fireEvent, render, screen } from '../../../utils/test-utils';
import { Props, RadioButtonGroup } from '.';

const mockProps: Pick<Props, 'label' | 'identifier' | 'variant' | 'radioButtons'> = {
  label: `Label`,
  identifier: 'test',
  variant: 'WITH_FRAME',
  radioButtons: [
    {
      value: 'one',
      description: 'one',
      label: 'One',
    },
    {
      value: 'two',
      description: 'two',
    },
    {
      value: 'three',
      label: 'Three',
    },
  ],
};

const RadioButtonGroupWrapper = (props: Partial<Props>): JSX.Element => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const onSelectionHandler = (event: { target: { value: SetStateAction<string | undefined> } }) => {
    setSelectedValue(event.target.value);
  };

  return (
    <>
      <RadioButtonGroup {...mockProps} {...props} onSelectionHandler={onSelectionHandler} />
      <p data-testid="radio-button-test-selected">{selectedValue}</p>
    </>
  );
};

describe('Render RadioButtonGroupWrapper Component', () => {
  it('should render', () => {
    render(<RadioButtonGroupWrapper />);
    const radioButtonGroupComponent = screen.getByTestId(TEST_IDS.RADIO_BUTTON_GROUP);
    const radioButtonComponents = screen.queryAllByTestId(TEST_IDS.RADIO_BUTTON);

    expect(radioButtonGroupComponent).toBeInTheDocument();
    expect(radioButtonComponents.length).toEqual(mockProps.radioButtons.length);
  });

  it('should check when clicked', () => {
    render(<RadioButtonGroupWrapper />);
    const radioButtonInputComponents = screen.queryAllByTestId(TEST_IDS.RADIO_BUTTON_INPUT) as HTMLInputElement[];
    radioButtonInputComponents.forEach((radioButtonInputComponent) => {
      expect(radioButtonInputComponent.checked).toEqual(false);
    });

    fireEvent.click(radioButtonInputComponents[0]);
    expect(radioButtonInputComponents[0].checked).toEqual(true);

    radioButtonInputComponents.forEach((radioButtonInputComponent, index) => {
      // First component is checked, others is not
      expect(radioButtonInputComponent.checked).toEqual(index === 0);
    });

    const selectedValue = screen.getByTestId('radio-button-test-selected').textContent;

    expect(selectedValue).toEqual(mockProps.radioButtons[0].value);
  });

  it('should not be able to check when disabled', () => {
    render(<RadioButtonGroupWrapper isDisabled={true} />);

    const radioButtonInputComponents = screen.queryAllByTestId(TEST_IDS.RADIO_BUTTON_INPUT) as HTMLInputElement[];
    radioButtonInputComponents.forEach((radioButtonInputComponent) => {
      expect(radioButtonInputComponent.checked).toEqual(false);
      expect(radioButtonInputComponent.disabled).toEqual(true);
    });

    // known issue that fireEvent can sometime invoke click event on disabled input
    // https://github.com/testing-library/dom-testing-library/issues/92
    // https://codesandbox.io/p/sandbox/testing-library-disabled-input-ignores-click-owohf?file=%2Fsrc%2Findex.js%3A30%2C23
    radioButtonInputComponents[0].click();
    expect(radioButtonInputComponents[0].checked).toEqual(false);

    radioButtonInputComponents.forEach((radioButtonInputComponent) => {
      expect(radioButtonInputComponent.checked).toEqual(false);
    });
  });
});
