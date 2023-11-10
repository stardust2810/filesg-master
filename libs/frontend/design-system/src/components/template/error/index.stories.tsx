import { Meta, Story } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import errorImage from '../../../assets/images/not-found.png';
import { Error, Props } from '.';

export default {
  title: 'Components/Template/Error',
  component: Error,
} as Meta;

export const Default: Story<Props> = (args: Props) => (
  <MemoryRouter>
    <Error {...args} />
  </MemoryRouter>
);

Default.args = {
  image: errorImage,
  tagText: 'Error 404',
  title: "We can't seem to find this page",
  descriptions: ['It might have been removed, changed its name, or is otherwise unavailable.', 'Here are some pages that might help:'],
  links: [
    { label: 'Frequently Asked Questions', to: '/faq' },
    { label: 'Home', to: '/' },
  ],
} as Props;
