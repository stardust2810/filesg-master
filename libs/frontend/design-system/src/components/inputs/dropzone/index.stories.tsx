import { Meta, Story } from '@storybook/react';
import styled from 'styled-components';

import { Dropzone, Props } from '.';

export default {
  title: 'Components/Inputs/File Upload Dropzone',
  component: Dropzone,
  argTypes: {
    buttonLabel: {
      description: 'Button label',
    },
    description: {
      description: 'Text Description that appears below button',
    },
    isLoading: {
      description: 'Button loading state',
    },
    dropzoneOptions: {
      description: 'Drop zone options',
    },
    accept: {
      description: 'File mime type or extension to be accepted',
    },
    onButtonClick: {
      description: 'Callback to trigger when button is clicked',
    },
  },
} as Meta<Props>;

const StyledDropzone = styled(Dropzone)`
  height: 240px;
  width: 400px;
`;

export const Primary: Story<Props> = (args) => <StyledDropzone {...args} />;
Primary.args = {
  buttonLabel: 'Select file',
  description: 'or drag file here',
  dropzoneOptions: {
    noClick: true,
    noKeyboard: true,
    multiple: false,
    maxSize: 10000000,
    useFsAccessApi: false,
  },
};
