import { Meta, Story } from '@storybook/react';
import { useState } from 'react';

import { Typography } from '../../data-display/typography';
import { Col } from '../../layout/col';
import { Row } from '../../layout/row';
import { Props, Select } from '.';
const options = [
  { label: 'Option One', value: 'one' },
  { label: 'Option Two, which has a really long label', value: 'two' },
  { label: 'Option Three', value: 3 },
  { label: 'Option Four', value: 4 },
  { label: 'Option Five', value: 5 },
  { label: 'Option Six', value: 6 },
  { label: 'Option Seven', value: 7 },
  { label: 'Option Eight', value: 8 },
  { label: 'Option Nine', value: 9 },
];

export default {
  title: 'Components/Inputs/Select',
  component: Select,
  argTypes: {
    placeholder: {
      description: 'Default placeholder label',
    },
    onChange: {
      description: "Change handler function that updates the selected value's state",
    },
    value: {
      description: 'State that stores the selected value',
    },
    fluid: {
      description: 'Set length to be width of content',
      defaultValue: 'false',
    },
    alignment: {
      description: 'Aligns the select menu',
    },
  },
} as Meta<Props>;

export const Default: Story<Props> = (args) => {
  const [value, setValue] = useState();

  function handleChange(value) {
    setValue(value);
  }

  return (
    <Row>
      <Col column={4} offset={4}>
        <Typography variant="BODY">Selected Value: {value}</Typography>
        <Select {...args} defaultValue={options[2].value} onChange={handleChange}></Select>
      </Col>
    </Row>
  );
};

Default.args = {
  placeholder: 'Select Option',
  options,
};

export const Fluid: Story<Props> = (args) => {
  const [value, setValue] = useState();

  function handleChange(value) {
    setValue(value);
  }
  return (
    <div style={{ textAlign: 'center', maxWidth: '100%' }}>
      <Typography variant="BODY">Selected Value: {value}</Typography>
      <Select {...args} onChange={handleChange}></Select>
    </div>
  );
};

Fluid.args = {
  fluid: true,
  placeholder: 'Select Option',
  alignment: 'CENTER',
  options,
};
