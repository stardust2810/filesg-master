import React from 'react'

import { TEST_IDS } from '../../../utils/constants'
import { fireEvent, render, screen } from '../../../utils/test-utils'
import { Checkbox, Props } from '.'

const mockProps: Props = {
  frame: true,
  label: 'TEST LABEL',
}

const CheckboxWrapper = (props: Props): JSX.Element => {
  const [selected, setselected] = React.useState(false)

  return <Checkbox selected={selected} onChange={() => setselected(!selected)} {...props} />
}

describe('Render Checkbox Component', () => {
  it('Test if Checkbox & text component renders', () => {
    render(<CheckboxWrapper {...mockProps} />)
    const checkboxComponent = screen.getByTestId(TEST_IDS.CHECKBOX)
    const textComponent = screen.getByTestId(TEST_IDS.TEXT)

    expect(checkboxComponent).toBeInTheDocument();
    expect(textComponent.textContent).toEqual(mockProps.label)
  })

  it('Test if Checkbox checks when clicked', () => {
    render(<CheckboxWrapper {...mockProps} />)
    const checkboxComponent = screen.getByTestId(TEST_IDS.CHECKBOX)
    const inputComponent = checkboxComponent.firstChild as HTMLInputElement

    fireEvent.click(checkboxComponent)
    expect(inputComponent?.checked).toEqual(true);
  })

  it('Test if Checkbox can be disabled', () => {
    render(<CheckboxWrapper disabled {...mockProps} />)
    const checkboxComponent = screen.getByTestId(TEST_IDS.CHECKBOX)
    const inputComponent = checkboxComponent.firstChild as HTMLInputElement

    expect(inputComponent).toBeDisabled();
    fireEvent.click(checkboxComponent)
    expect(inputComponent?.checked).toEqual(false);
  })
})
