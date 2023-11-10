import { Meta, Story } from '@storybook/react';

import { Avatar, Props } from '.';

export default {
  title: 'Components/Data Display/Avatar',
  component: Avatar,
} as Meta<Props>;

const Template: Story<Props> = (args) => <Avatar {...args} />;

export const Default: Story<Props> = Template.bind({});

Default.args = { size: 32, imageUrl: 'http://www.dev.file.gov.sg/assets/images/icons/agency/ica/emblem.png', alt: 'Test alt text' };
