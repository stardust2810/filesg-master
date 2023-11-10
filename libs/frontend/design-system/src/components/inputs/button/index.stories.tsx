import { Meta, Story } from '@storybook/react';

import { Button, Props } from '.';

export default {
  title: 'Components/Inputs/Button',
  component: Button,
  argTypes: {
    label: {
      description: 'Label displayed on the button',
    },
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
    fullWidth: {
      description: 'Button takes up full width of container',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    startIcon: {
      description: 'Icon on the left of label',
    },
    endIcon: {
      description: 'Icon on the right of label',
    },
    onClick: {
      description: 'onClick function',
      action: 'clicked',
    },
    isLoading: {
      description: 'Sets button to display loader',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args): JSX.Element => <Button {...args} />;

export const ButtonStart: Story<Props> = Template.bind({});
ButtonStart.args = {
  label: 'Button',
  startIcon: 'sgds-icon-arrow-left',
  onClick: () => console.log('Click'),
};

export const ButtonEnd: Story<Props> = Template.bind({});
ButtonEnd.args = {
  label: 'Button',
  decoration: 'OUTLINE',
  color: 'SECONDARY',
  endIcon: 'sgds-icon-arrow-right',
  onClick: () => console.log('Click'),
};

export const ButtonStartEnd: Story<Props> = Template.bind({});
ButtonStartEnd.args = {
  label: 'Button',
  decoration: 'OUTLINE',
  color: 'SECONDARY',
  startIcon: 'sgds-icon-arrow-left',
  endIcon: 'sgds-icon-arrow-right',
  onClick: () => console.log('Click'),
};

export const ButtonNoIcon: Story<Props> = Template.bind({});
ButtonNoIcon.args = {
  label: 'Button',
  decoration: 'OUTLINE',
  color: 'SECONDARY',
  size: 'NORMAL',
  disabled: false,
  fullWidth: false,
  onClick: () => console.log('Click'),
};
