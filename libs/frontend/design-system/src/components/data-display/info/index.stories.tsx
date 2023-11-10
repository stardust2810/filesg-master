import { Meta, Story } from '@storybook/react';

import Svg from '../../../assets/file-icons/fsg-icon-file-excel-mini.svg';
import { Info, Props } from '.';

export default {
  title: 'Components/Data Display/Info',
  component: Info,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <div style={{ width: 640 }}>
    <Info {...args} />
  </div>
);

export const Default: Story<Props> = Template.bind({});
Default.args = {
  image: Svg,
  tagText: 'Error 50x',
  title: 'Any Title Goes Here',
  descriptions: [
    'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam, deleniti accusamus aliquam commodi nisi possimus architecto minima deserunt corporis hic ipsa, nemo maiores pariatur, laborum eveniet. Saepe impedit animi iure.',
    'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam, deleniti accusamus aliquam commodi nisi possimus ',
  ],
};
