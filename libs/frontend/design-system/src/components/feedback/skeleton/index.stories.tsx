import { Meta, Story } from '@storybook/react';

import { Props, Skeleton } from '.';

type StoryProps = Props;

export default {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  argTypes: {
    variant: {
      description: 'Show modal',
      table: {
        defaultValue: 'TEXT',
      },
    },
    diameter: {
      table: {
        defaultValue: 30,
      },
    },
    width: {
      table: {
        defaultValue: 200,
      },
    },
    height: {
      table: {
        defaultValue: 20,
      },
    },
    borderRadiusInPx: {
      table: {
        defaultValue: 8,
      },
    },
    textVariant: {
      table: {
        defaultValue: 'BODY',
      },
    },
  },
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args): JSX.Element => {
  return <Skeleton {...args}></Skeleton>;
};

export const Circle: Story<StoryProps> = Template.bind({});
Circle.args = {
  variant: 'CIRCLE',
  diameter: 30,
};

export const Text: Story<StoryProps> = Template.bind({});
Text.args = {
  variant: 'TEXT',
};

export const Rectangle: Story<StoryProps> = Template.bind({});
Rectangle.args = {
  variant: 'RECTANGLE',
};
