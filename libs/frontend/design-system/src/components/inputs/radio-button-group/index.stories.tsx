import { Meta, Story } from '@storybook/react';
import React, { SetStateAction, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '../button';
import { Props, RadioButtonGroup } from '.';

export default {
  title: 'Components/Inputs/Radio Button Group',
  component: RadioButtonGroup,
  argTypes: {},
} as Meta<Props>;

const Template: Story<Props> = (args) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const onSelectionHandler = (event: { target: { value: SetStateAction<string | undefined> } }) => {
    setSelectedValue(event.target.value);
  };

  return (
    <>
      <RadioButtonGroup {...args} onSelectionHandler={onSelectionHandler} />
      <br></br>
      Selected value: {selectedValue}
    </>
  );
};
export const Default: Story<Props> = Template.bind({});
Default.args = {
  label: `Label`,
  description: `This is the hint text`,
  identifier: 'test',
  radioButtons: [
    {
      value: 'one',
      description: 'Radio button label one',
    },
    {
      value: 'two',
      description: 'Radio button label two',
    },
    {
      value: 'three',
      description: 'Radio button label three',
    },
  ],
};

export const WithFrame: Story<Props> = Template.bind({});

WithFrame.args = {
  label: `Label`,
  description: `This is the hint text`,
  identifier: 'test',
  variant: 'WITH_FRAME',
  radioButtons: [
    {
      value: 'one',
      description: 'Radio button label one',
    },
    {
      value: 'two',
      description: 'Radio button label two',
    },
    {
      value: 'three',
      description: 'Radio button label three',
    },
  ],
};
export const WithFrameAndTitle: Story<Props> = Template.bind({});

WithFrameAndTitle.args = {
  label: `Label`,
  description: `This is the hint text`,
  identifier: 'test',
  variant: 'WITH_FRAME',
  radioButtons: [
    {
      value: 'email',
      description: 'jo******an@gmail.com',
      label: 'Email',
    },
    {
      value: 'mobile',
      label: 'Mobile SMS',
      description: '+65****5678',
    },
  ],
};
interface MockFormInput {
  language: string;
}
const FormTemplate: Story<Props> = (args) => {
  const [submittedValue, setSubmittedValue] = useState<string>();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
    register,
  } = useForm<MockFormInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSelectionHandler = (event) => {
    setValue('language', event.target.value);
  };

  const onSubmitHandler = ({ language: selectedLanguage }: MockFormInput) => {
    console.log(`ON SUBMIT`, selectedLanguage);
    setSubmittedValue(selectedLanguage);
  };
  const language = useWatch({
    control: control,
    name: 'language',
  });
  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} style={{ maxWidth: '584px' }}>
      <RadioButtonGroup {...args} onSelectionHandler={onSelectionHandler} register={register} errorMessage={errors.language?.message} />
      <br />
      {language && <>Selected value: {language}</>}
      <Button type="submit" label="Submit with validation" disabled={!isValid} />
      <br />
      <Button type="submit" label="Submit without validation" />
      {submittedValue && <>Submitted value: {submittedValue}</>}
    </form>
  );
};

export const WithForm: Story<Props> = FormTemplate.bind({});

WithForm.args = {
  label: `Choose a language`,
  description: `Any language`,
  identifier: 'language',
  variant: 'WITH_FRAME',
  isRequired: true,
  radioButtons: [
    {
      value: 'malay',
      description: 'Malay',
    },
    {
      value: 'tamil',
      description: 'Tamil',
    },
    {
      value: 'chinese',
      description: 'Chinese',
    },
    {
      value: 'english',
      description: 'English',
    },
  ],
};

export const WithLongLabels: Story<Props> = FormTemplate.bind({});

WithLongLabels.args = {
  label: `Choose an option`,
  description: `Any option`,
  identifier: 'yay',
  variant: 'WITH_FRAME',
  isRequired: true,
  radioButtons: [
    {
      value: 'hihi',
      description: 'thisIsAVeryVeryVeryVeryVeryExceptionallyLongDescriptionThatHasNoSpaceInBetween',
    },
    {
      value: 'nihao',
      description: 'this is another super duper long description but with spaace in between',
    },
    {
      value: 'konnichiha',
      label: 'this is a very very very very very exceptionally long label with spaaace in between',
    },
    {
      value: 'annyeonghaseyo',
      label: 'thisIsAnotherSuperDuperLongLabelButWithoutSpaceInBetween',
    },
  ],
};
