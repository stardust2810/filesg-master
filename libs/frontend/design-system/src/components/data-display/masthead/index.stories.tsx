import { Meta, Story } from '@storybook/react';

import { Masthead, Props } from '.';

export default {
  title: 'Components/Data Display/Masthead',
  component: Masthead,
} as Meta;

export const Default: Story = (args: Props) => <Masthead {...args} />;
