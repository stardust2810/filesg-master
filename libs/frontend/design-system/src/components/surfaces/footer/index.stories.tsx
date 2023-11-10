import { Meta, Story } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Color } from '../../../styles/color';
import { Footer, Props } from '.';

export default {
  title: 'Components/Surfaces/Footer',
  component: Footer,
  argTypes: {},
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <MemoryRouter>
    <Footer {...args} />
  </MemoryRouter>
);
const url = 'http://google.com';

export const Default = Template.bind({});
Default.args = {
  title: 'FileSG',
  description:
    'FileSG is a secure digital document management platform that allows members of the public to easily access and download documents issued by the government.',
  footerBackgrdColor: Color.GREY80,
  sitemapLinks: [
    {
      label: 'Retrieve',
      to: url,
    },
    {
      label: 'Verify',
      to: url,
    },
  ],
  topSectionLinks: [
    {
      label: 'Help Center',
      to: url,
    },
    {
      label: 'Contact Us',
      to: url,
    },
  ],
  bottomSectionLinks: [
    {
      label: 'Report Vulnerability',
      to: url,
      external: true,
    },
    {
      label: 'Privacy Statement',
      to: url,
    },
    {
      label: 'Terms of Use',
      to: url,
    },
  ],
  updatedDate: new Date('12 Nov 2021'),
};
