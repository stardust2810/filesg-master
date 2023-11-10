import { Meta, Story } from '@storybook/react';

import { Props, Spinner } from '.';

type StoryProps = Props;

export default {
  title: 'Components/Feedback/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  }
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args): JSX.Element => {
  return <Spinner {...args}></Spinner>;
};

export const Default: Story<StoryProps> = Template.bind({});
Default.args = {
  mainMessage: 'Main Message',
  secondaryMessage: 'Secondary Message',
};
