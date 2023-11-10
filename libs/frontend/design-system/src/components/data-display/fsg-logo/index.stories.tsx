import { Meta, Story } from '@storybook/react';

import { FileSGLogo, Props } from '.';

export default {
  title: 'Components/Data Display/FileSG Logo',
  component: FileSGLogo,
} as Meta<Props>;

const Template: Story<Props> = () => <FileSGLogo />;

export const Default: Story<Props> = Template.bind({});
