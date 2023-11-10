import { Meta, Story } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { AppHeader, Props } from '.';

export default {
  title: 'Components/Surfaces/AppHeader',
  component: AppHeader,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <MemoryRouter>
    <div style={{ width: '100%', height: '100vh', outline: '1px dashed lightgrey' }}>
      <AppHeader {...args} />
    </div>
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {
  onLogoClick: '/',
  navItems: [
    { label: 'Link 1', to: '/' },
    { label: 'Link 2', to: '/2' },
    { label: 'Link 3', to: '/3' },
  ],
  uncollapsibleActionItems: [
    {
      label: 'Button label',
      onClick: () => {
        //noop
      },
    },
  ],
  collapsibleActionItems: [
    {
      icon: 'sgds-icon-person',
      testLocatorName: 'person',
      onClick: () => {
        //noop
      },
    },
  ],
};

const EmptyTemplate: Story<Props> = (args) => (
  <div style={{ width: '100%', height: '100vh', outline: '1px dashed lightgrey' }}>
    <AppHeader {...args} />
  </div>
);
export const Empty = EmptyTemplate.bind({});
Empty.args = {
  onLogoClick: () => {
    //noop
  },
  navItems: [],
  uncollapsibleActionItems: [],
  collapsibleActionItems: [],
};
