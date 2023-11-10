import { Meta, Story } from '@storybook/react';

import { Props,TextButton } from '.';

export default {
  title: 'Components/Inputs/Text Button',
  component: TextButton,
  argTypes: {},
} as Meta<Props>;

const Template: Story<Props> = (args) => <TextButton {...args} />;

export const Default: Story<Props> = Template.bind({});
Default.args = {
  label: 'Button',
  onClick: () => console.log('Click'),
  disabled: false,
};

export const Icon: Story<Props> = Template.bind({});
Icon.args = {
  label: 'Button',
  startIcon: 'sgds-icon-check',
  onClick: () => console.log('Click'),
  disabled: false,
};
