import { Meta, Story } from '@storybook/react';

import { Divider, Props } from '.';

export default {
  title: 'Components/Data Display/Divider',
  component: Divider,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <div style={{ width: '100%' }}>
    <Divider {...args} />
  </div>
);

export const Default: Story<Props> = Template.bind({});
Default.args = {};
export const TextDivider: Story<Props> = Template.bind({});
TextDivider.args = {
  children: 'Text',
};
