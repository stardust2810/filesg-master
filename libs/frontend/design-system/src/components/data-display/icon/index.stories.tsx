import { Meta, Story } from '@storybook/react';

import { Icon, Props } from '.';

export default {
  title: 'Components/Data Display/Icon',
  component: Icon,
  argTypes: {
    icon: {
      description: 'Class name of icon',
      control: {
        type: 'select',
      },
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args) => <Icon {...args} />;

export const FSGIcons: Story<Props> = Template.bind({});
FSGIcons.args = {
  icon: 'fsg-icon-loading',
  size: 'ICON_NORMAL',
};

export const SGDSIcons: Story<Props> = Template.bind({});
SGDSIcons.args = {
  icon: 'sgds-icon-sg-crest',
  size: 'ICON_NORMAL',
};
