import { Meta, Story } from '@storybook/react';
import { useRef, useState } from 'react';

import { DatePicker, DatePickerStatus, DateValue, Props } from '.';
export default {
  title: 'Components/Inputs/Date Picker',
  component: DatePicker,
  argTypes: {
    color: {
      control: 'color',
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args) => {
  const [date, setDate] = useState<DateValue>({ day: '', month: '', year: '' });
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const datePickerRefs = useRef({ dayRef, monthRef, yearRef });

  return (
    <DatePicker
      {...args}
      ref={datePickerRefs}
      date={date}
      onDateChange={(newValue) => setDate(newValue)}
      disabled={false}
    />
  );
};

export const Default: Story<Props> = Template.bind({});
Default.args = {};

export const Error: Story<Props> = Template.bind({});
Error.args = {
  status: DatePickerStatus.INVALID,
  errorMessage: 'This is an error message',
};
