import { Meta, Story } from '@storybook/react';

import { Typography } from '../typography';
import { Bold, Props } from '.';

type BoldProps = Props;

export default {
  title: 'Components/Data Display/Bold',
  component: Bold,
} as Meta<BoldProps>;

const Template: Story<BoldProps> = (args) => (
  <Typography variant="BODY">
    The quick brown fox <Bold {...args} /> over the lazy dog
  </Typography>
);

export const Default: Story<BoldProps> = Template.bind({});
Default.args = {
  type: 'FULL',
  children: 'jumps',
};
