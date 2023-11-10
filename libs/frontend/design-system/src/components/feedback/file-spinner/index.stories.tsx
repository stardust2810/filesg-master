import { Meta, Story } from '@storybook/react';

import { FileSpinner } from '.';

type StoryProps = Record<string, never>;

export default {
  title: 'Components/Feedback/FileSpinner',
  component: FileSpinner,
  parameters: {
    layout: 'centered',
  },
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (): JSX.Element => {
  return (
    <div>
      <FileSpinner>Loading file...</FileSpinner>
    </div>
  );
};

export const Default: Story<StoryProps> = Template.bind({});
