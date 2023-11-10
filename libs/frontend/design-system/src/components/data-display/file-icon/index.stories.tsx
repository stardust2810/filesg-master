import { Meta, Story } from '@storybook/react';

import { FileIcon, Props } from '.';

export default {
  title: 'Components/Data Display/File Icon',
  component: FileIcon,
} as Meta<Props>;

const Template: Story<Props> = (args) => <FileIcon {...args} />;

export const Default: Story<Props> = Template.bind({});
Default.args = {
  variant: 'solid',
  type: 'oa'
};
