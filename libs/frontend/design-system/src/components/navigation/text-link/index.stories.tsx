import { Meta, Story } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Props,TextLink } from '.';

export default {
  title: 'Components/Navigation/Text Link',
  component: TextLink,
} as Meta;
const Template: Story<Props> = (args) => (
  <MemoryRouter>
    <TextLink {...args}>HelloWorld</TextLink>
  </MemoryRouter>
);

export const Default: Story<Props> = Template.bind({});
export const Anchor: Story<Props> = Template.bind({});

Default.args = {
  disabled: false,
  to: '#',
  type: 'LINK',
} as Props;

Anchor.args = {
  disabled: false,
  to: '#',
  type: 'ANCHOR',
} as Props;
