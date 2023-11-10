import { Meta, Story } from '@storybook/react';

import { AnnouncementBanner, Props } from '.';

export default {
  title: 'Components/Data Display/Announcement Banner',
  component: AnnouncementBanner,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;
const Template: Story<Props> = (args) => <AnnouncementBanner {...args} />;

export const Default: Story<Props> = Template.bind({});

Default.args = {
  type: 'TECHNICAL',
  title: 'Scheduled Maintenance',
  description: 'FileSG will be unavailable from: 28 July 2022, 2:00 AM to 28 July 2022, 5:00 AM',
  onClose: () => {
    // nop
  },
};

export const WithoutCloseBtn: Story<Props> = Template.bind({});
WithoutCloseBtn.args = {
  type: 'TECHNICAL',
  title: 'Scheduled Maintenance',
  description: 'FileSG will be unavailable from: 28 July 2022, 2:00 AM to 28 July 2022, 5:00 AM',
};

export const FeatureTagBanner: Story<Props> = Template.bind({});
FeatureTagBanner.args = {
  tag: 'Tag',
  type: 'FEATURE_TAG',
  description: 'Describe the event and give further instructions, include links if necessary.',
};
