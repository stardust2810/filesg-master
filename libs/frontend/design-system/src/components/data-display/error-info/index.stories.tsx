import { Meta, Story } from '@storybook/react';

import errorImage from '../../../assets/images/not-found.png';
import { ErrorInfo, Props } from '.';

export default {
  title: 'Components/Data Display/Error Info',
  component: ErrorInfo,
} as Meta;

export const Default: Story<Props> = (args: Props) => <ErrorInfo {...args} />;

Default.args = {
  title: "We can't seem to find this page",
  image: errorImage,
  descriptions: [
    "It might have been removed, changed its name, or is otherwise unavailable.",
    'Here are some pages that might help:',
  ],
  tagText: 'Error 404',
  isCentered: false,
} as Props;
