import { Meta, Story } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { Color } from '../../..';
import { List, Props } from '.';
import { IListItem } from './components/list-item';

export default {
  title: 'Components/Data Display/List',
  component: List,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <MemoryRouter>
    <div style={{ width: '360px', backgroundColor: Color.GREY10 }}>
      <List {...args} />
    </div>
  </MemoryRouter>
);
const items: IListItem[] = [
  {
    label: 'Link 1',
    to: '/',
  },
  {
    label: 'Link 2',
    to: '/2',
    dropdowns: [
      {
        label: 'Link 2 child',
        to: '/2',
        icon: 'sgds-icon-file-alt',
      },
      {
        label: 'Action 1',
        icon: 'sgds-icon-file-alt',
        onClick: () => {
          //no op
        },
      },
    ],
  },
  {
    label: 'Action 2',
    onClick: () => {
      //no op
    },
  },
];
export const Default: Story<Props> = Template.bind({});
Default.args = {
  items: items,
};
