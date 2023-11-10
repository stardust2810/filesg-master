import { Meta, Story } from '@storybook/react';

import { Color } from '../../../styles/color';
import { Col } from '../../layout/col';
import { Props, Typography } from '.';

export default {
  title: 'Components/Data Display/Text',
  component: Typography,
  argTypes: {
    variant: {
      description: 'Different variant of text',
      control: {
        type: 'select',
      },
    },
    bold: {
      description: 'set text bold',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args) => <Typography {...args} />;

export const Default: Story<Props> = Template.bind({});
Default.args = {
  variant: 'H1',
  ellipsisLine: 1,
  children: 'Text example',
};

const ColumnTemplate = (args: Props) => (
  <Col style={{ backgroundColor: Color.GREY30 }} column={3}>
    <Typography {...args} />
  </Col>
);
export const Truncate3Cols: Story<Props> = ColumnTemplate.bind({});
Truncate3Cols.args = {
  variant: 'H1',
  children:
    'This is a long text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam faucibus eros vitae erat laoreet condimentum in quis libero. Nullam sit amet augue varius, tincidunt nisl in, sagittis urna. ',
  ellipsisLine: 2,
  isEllipsis: true,
};
