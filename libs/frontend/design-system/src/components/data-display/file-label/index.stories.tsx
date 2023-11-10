import { Meta, Story } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { FileLabel, Props } from '.';

export default {
  title: 'Components/Data Display/File Label',
  component: FileLabel,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <MemoryRouter>
    <div style={{ width: '660px', padding: '10px', flexDirection: 'column', border: '1px solid black' }}>
      <span>This is a 640px div</span>
      <FileLabel {...args} />
    </div>
  </MemoryRouter>
);

export const AcceptedFile: Story<Props> = Template.bind({});
AcceptedFile.args = {
  name: 'Random File Name.jpg',
  size: '10 MB',
  type: 'jpg',
  linkTo: '/',
  onButtonClick: () => console.log('Button click'),
};
AcceptedFile.story = {
  parameters: {
    docs: {
      description: {
        component:
          'File label is a organism component used to display basic file information for user to click in should they want to load the document page.',
      },
    },
  },
};
export const RejectedFile: Story<Props> = Template.bind({});
RejectedFile.args = {
  name: 'file-1.jpg',
  size: '15 MB',
  type: 'zip',
  linkTo: '/',
  errorMessage: 'File size exceeded 10 MB',
  onButtonClick: () => console.log('Click'),
};
