import { Meta, Story } from '@storybook/react';

import { Col, Props } from '.';

export default {
  title: 'Components/Layout/Col',
  parameters: {},
  component: Col,
  argTypes: {
    column: {
      control: { type: 'range', min: 1, max: 12 },
    },
    offset: {
      control: { type: 'range', min: 1, max: 12 },
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (props) => <Col {...props} />;

export const Default: Story<Props> = Template.bind({});
Default.args = {
  children: [
    <div key="1" style={{ border: '1px solid purple' }}>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia, sunt?
    </div>,
    <div key="2" style={{ border: '1px solid purple' }}>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia, sunt?
    </div>,
  ],
  column: 2,
  isNested: false,
  offset: 2,
};
