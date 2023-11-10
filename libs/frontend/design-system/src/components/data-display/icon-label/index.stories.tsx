import { Meta, Story } from '@storybook/react';

import { Color } from '../../../styles/color';
import { Typography } from '../typography';
import { IconLabel, Props } from '.';

export default {
  title: 'Components/Data Display/Icon Label',
  component: IconLabel,
  argTypes: {
    icon: {
      description: 'Class name of icon',
      control: {
        type: 'select',
      },
    },
    title: {
      description: 'Title',
      control: {
        type: 'text',
      },
    },
    description: {
      description: 'Description',
      control: {
        type: 'text',
      },
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args) => {
  return <IconLabel {...args} />;
};

export const WithBackground: Story<Props> = Template.bind({});
WithBackground.args = {
  icon: 'sgds-icon-upload',
  iconBackgroundColor: Color.PURPLE_LIGHTEST,
  title: (
    <Typography variant="BODY" bold="FULL">
      File Size
    </Typography>
  ),
  description: <Typography variant="BODY">10 MB per file</Typography>,
};

export const NoBackground: Story<Props> = Template.bind({});
NoBackground.args = {
  icon: 'sgds-icon-circle-warning',
  iconSize: 'ICON_SMALL',
  iconColor: Color.RED_DEFAULT,
  gap: '0.5rem',
  title: (
    <Typography variant="BODY" color={Color.RED_DEFAULT}>
      File Size cannot exceed 10 MB.
    </Typography>
  ),
};
