import { Meta, Story } from '@storybook/react';

import { Typography } from '../../data-display/typography';
import { Alert, Props } from '.';

export default {
  title: 'Components/Feedback/Alert',
  component: Alert,
  argTypes: {
    block: {
      description: 'full',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} as Meta<Props>;

const label = (variant: string) => <Typography variant="BODY">This is {variant} banner.</Typography>;

const Template: Story<Props> = (args) => <Alert {...args}>{args.children}</Alert>;

export const Error: Story<Props> = Template.bind({});
Error.args = {
  variant: 'DANGER',
  children: label('an error'),
};

export const Success: Story<Props> = Template.bind({});
Success.args = {
  variant: 'SUCCESS',
  children: label('a success'),
};

export const Warning: Story<Props> = Template.bind({});
Warning.args = {
  variant: 'WARNING',
  children: label('a warning'),
};

export const Info: Story<Props> = Template.bind({});
Info.args = {
  variant: 'INFO',
  children: label('an information'),
  block: true,
};
