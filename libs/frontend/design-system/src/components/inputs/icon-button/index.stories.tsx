import { Meta, Story } from '@storybook/react';

import { IconButton, Props } from '.';

export default {
  title: 'Components/Inputs/Icon Button',
  component: IconButton,
  argTypes: {
    color: {
      description: 'Color theme',
      table: {
        defaultValue: { summary: 'PRIMARY' },
      },
    },
    decoration: {
      description: 'Outline / fill decoration',
      table: {
        defaultValue: { summary: 'SOLID' },
      },
    },
    icon: {
      description: 'Icon string name',
    },
    iconColor: {
      description: 'Icon color',
    },
    size: {
      description: 'Adjust size',
      table: {
        defaultValue: { summary: 'NORMAL' },
      },
    },
    disabled: {
      description: 'Disables button',
      table: {
        defaultValue: { summary: 'false' },
      },
      control: { type: 'boolean' },
    },
    block: {
      description: 'Toggles button width to 100% of container',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    round: {
      description: 'Rounded shape or not',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      description: 'onClick function',
    },
    isLoading: {
      description: 'Sets button to display loader',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args) => <IconButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  icon: 'sgds-icon-add-image',
  onClick: () => console.log('Click'),
};

export const Secondary = Template.bind({});
Secondary.args = {
  decoration: 'OUTLINE',
  color: 'SECONDARY',
  icon: 'sgds-icon-accordion',
  onClick: () => console.log('Click'),
};
