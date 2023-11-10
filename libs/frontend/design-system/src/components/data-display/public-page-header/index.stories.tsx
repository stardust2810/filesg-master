import { Meta, Story } from '@storybook/react';

import { Props, PublicPageDescriptor } from '.';

export default {
  title: 'Components/Data Display/Public Page Header',
  component: PublicPageDescriptor,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <div style={{ width: '100%' }}>
    <PublicPageDescriptor {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Page Title',
  description: 'Page description - Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
};
