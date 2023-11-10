import { Meta, Story } from '@storybook/react';

import { Level2Accordion, Props } from '.';

export default {
  title: 'Components/Surfaces/Accordion/Level 2',
  component: Level2Accordion,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <div style={{ width: '50%', padding: '2rem' }}>
    <Level2Accordion {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Why are some sunsets redder than usual?',
  children: "I don't know",
};
