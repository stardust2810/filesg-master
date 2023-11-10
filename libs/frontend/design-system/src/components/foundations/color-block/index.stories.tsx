import { Meta } from '@storybook/react';

import { ColorBlock } from '.';

export default {
  title: 'Foundations/Color Palette',
  parameters: {},
  component: ColorBlock,
} as Meta;

const Template = () => <ColorBlock />;

export const ColorPalette = Template.bind({});
