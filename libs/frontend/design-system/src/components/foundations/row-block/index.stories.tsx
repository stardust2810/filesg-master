import { Meta } from '@storybook/react';

import { RowBlock } from '.';
export default {
  title: 'Foundations/Grid',
  parameters: {},
  component: RowBlock,
} as Meta;

const Template = () => <RowBlock />;

export const Grid = Template.bind({});
