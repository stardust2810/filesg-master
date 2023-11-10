import { Meta, Story } from '@storybook/react';
import React from 'react';

import { Color } from '../../../styles/color';
import { Checkbox, Props } from '.';

export default {
  title: 'Components/Inputs/Checkbox',
  component: Checkbox,
  argTypes: {
    color: {
      control: 'color',
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args) => {
  const [selected, setSelected] = React.useState(false);

  function handleChange() {
    setSelected(!selected);
  }

  return <Checkbox selected={selected} onChange={handleChange} {...args} />;
};

export const Default: Story<Props> = Template.bind({});
Default.args = {
  color: Color.PURPLE_DEFAULT,
};

export const WithLabel: Story<Props> = Template.bind({});
WithLabel.args = {
  color: Color.PURPLE_DARKER,
  label: 'Checkbox',
};

export const WithFrame: Story<Props> = Template.bind({});
WithFrame.args = {
  frame: true,
  color: Color.PURPLE_DARKER,
  label: 'Checkbox',
  disabled: false,
};

export const Disabled: Story<Props> = Template.bind({});
Disabled.args = {
  frame: true,
  color: Color.PURPLE_DARKER,
  label: 'Checkbox',
  disabled: true,
};
