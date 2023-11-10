import { Meta, Story } from '@storybook/react';

import { Col } from '../col';
import { Props,Row } from '.';

export default {
  title: 'Components/Layout/Row',
  parameters: {},
  component: Row,
} as Meta<Props>;

const Template: Story<Props> = (props) => <Row {...props} />;

export const Default: Story<Props> = Template.bind({});
Default.args = {
  children: [
    <Col column={6}>Children testing Children testing Children testing 1</Col>,
    <Col column={5}>Children testing Children testing Children testing 2</Col>,
    <Col column={3}>Children testing Children testing Children testing 3</Col>,
  ],
  isDesktop: true,
  isMultiline: false,
}

export const Single: Story<Props> = Template.bind({});
Single.args = {
  children: <Col column={2}>Children testing Children testing Children testing</Col>,
  isDesktop: true,
  isMultiline: false,
}

export const Multiple: Story<Props> = Template.bind({});
Multiple.args = {
  children: [
    <Col column={6}>Children testing Children testing Children testing 1</Col>,
    <Col column={5}>Children testing Children testing Children testing 2</Col>,
    <Col column={3}>Children testing Children testing Children testing 3</Col>,
  ],
  isDesktop: true,
  isMultiline: false,
}
