import { Meta, Story } from '@storybook/react';
import { Suspense } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AppLayoutTemplate, Props } from '.';

export default {
  title: 'Components/Template/App Layout',
  parameters: {
    layout: 'fullscreen',
  },
  component: AppLayoutTemplate,
} as Meta<Props>;

const Template: Story<Props> = (props) => (
  <div style={{ height: '100vh', width: '100vw', display: 'flex' }}>
    <MemoryRouter>
      <AppLayoutTemplate {...props} />
    </MemoryRouter>
  </div>
);

const TestRouter = () => (
  <Suspense fallback={<div>FALLBACK</div>}>
    <Routes>
      <Route path="/" element={<div> PAGE ONE</div>} />

      <Route path="/2" element={<div>PAGE TWO</div>} />
    </Routes>
  </Suspense>
);

export const Default: Story<Props> = Template.bind({});
Default.args = {
  homeRoute: '/',
  headerNavItems: [
    { label: 'Page One', to: '/' },
    { label: 'Page Two', to: '/2' },
  ],
  footerTitle: 'Footer title',
  footerUpdatedDate: new Date(),
  footerBottomSectionLinks: [],
  footerTopSectionLinks: [],
  router: <TestRouter />,
};
