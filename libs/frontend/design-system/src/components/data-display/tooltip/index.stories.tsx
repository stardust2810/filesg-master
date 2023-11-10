import { Meta, Story } from '@storybook/react';

import { Tag } from '../tag';
import { Props, Tooltip } from '.';
import { DisplayDiv } from './style';
export default {
  title: 'Components/Data Display/Tooltip',
  component: Tooltip,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <DisplayDiv>
    <Tooltip {...args} />
  </DisplayDiv>
);

export const Default: Story<Props> = Template.bind({});
Default.args = { identifier: 'example_tooltip', content: 'This is supposed to be a longer tooltip than usual' };

export const CustomisedTagTrigger: Story<Props> = Template.bind({});
CustomisedTagTrigger.args = {
  identifier: 'example_tooltip_tag_trigger',
  content: 'This is my tooltip content',
  uiTriggerComponent: <Tag>UI Trigger</Tag>,
};
