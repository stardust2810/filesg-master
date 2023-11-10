import { Meta, Story } from '@storybook/react';

import { Carousel, Props } from '.';

const Slide = ({ index }: { index: number }) => (
  <div
    style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#c6c6c6' }}
  >
    This is slide {index}
  </div>
);

const slides = [1, 2, 3].map((num) => <Slide index={num} />);

export default {
  title: 'Components/Data Display/Carousel',
  component: Carousel,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <div style={{ width: '100%' }}>
    <Carousel {...args} />
  </div>
);

export const Default: Story<Props> = Template.bind({});
Default.args = {
  slideItems: slides,
};
