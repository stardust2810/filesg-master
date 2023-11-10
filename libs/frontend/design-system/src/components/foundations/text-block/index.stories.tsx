import { Meta } from '@storybook/react';

import { TextBlock } from '.';

export default {
  title: 'Foundations/Typography',
  parameters: {},
  component: TextBlock,
} as Meta;

const Template = () => <TextBlock />;

export const Typography = Template.bind({});
