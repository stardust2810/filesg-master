import { Meta, Story } from '@storybook/react';

import { Props, TextInput } from '.';

export default {
  title: 'Components/Inputs/Text Input',
  component: TextInput,
} as Meta<Props>;

const Template: Story<Props> = (args) => (
  <form>
    <TextInput {...args} />
  </form>
);

export const Default: Story<Props> = Template.bind({});
Default.args = {
  label: 'Field Label',
  type: 'email',
  placeholder: 'Text',
  autoComplete: 'on',
  formNoValidate: true,
};

export const Success: Story<Props> = Template.bind({});
Success.args = {
  label: 'Field Label',
  successMessage: 'This is a success message',
};

export const Error: Story<Props> = Template.bind({});
Error.args = {
  label: 'Field Label',
  errorMessage: 'This is an error message',
};
