import { Meta, Story } from '@storybook/react';

import { Level1Accordion, Props } from '.';

export default {
  title: 'Components/Surfaces/Accordion/Level 1',
  component: Level1Accordion,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <div style={{ width: '100%' }}>
    <Level1Accordion {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Why are some sunsets redder than usual?',
  children: "I don't know.",
};
