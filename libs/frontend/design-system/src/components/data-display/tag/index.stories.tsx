import { Meta, Story } from '@storybook/react';

import { Props,Tag } from '.';

export default {
  title: 'Components/Data Display/Tag',
  component: Tag,
} as Meta<Props>;

const Template: Story<Props> = (args) => <Tag {...args} />;

export const Filled: Story<Props> = Template.bind({});
Filled.args = {
  color: 'PRIMARY',
  children: 'Powered by FileSG',
};

export const Outlined: Story<Props> = Template.bind({});
Outlined.args = {
  variant: 'OUTLINED',
  color: 'PRIMARY',
  children: 'Powered by FileSG',
};
