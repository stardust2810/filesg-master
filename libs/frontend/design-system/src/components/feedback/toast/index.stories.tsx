import { Meta, Story } from '@storybook/react';
import { toast } from 'react-toastify';

import { Color } from '../../../styles/color';
import { Icon } from '../../data-display/icon';
import { Button } from '../../inputs/button';
import { Props, Toast } from '.';
interface CustomTemplateProps {
  onClickHandler: () => void;
}

type StoryProps = Props & CustomTemplateProps;

export default {
  title: 'Components/Feedback/Toast',
  component: Toast,
  argTypes: {
    position: {
      description: 'Position of toast.',
      control: {
        type: 'select',
      },
    },
    autoClose: {
      description: 'Whether toast should close automatically.',
    },
    newestOnTop: { description: 'Whether newest toast should appear from top.' },
    hasExitCross: { description: 'Whether toast contains exit icon.' },
  },
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args: StoryProps): JSX.Element => {
  return (
    <>
      <Button label="Show Toast" onClick={args.onClickHandler} />
      <Toast {...args} />
    </>
  );
};

export const Success: Story<StoryProps> = Template.bind({});
Success.args = {
  onClickHandler: () => {
    toast.success('Success Toast', {
      icon: <Icon icon="fsg-icon-circle-check-solid" color={Color.GREEN_DEFAULT} />,
    });
  },
};

export const Error: Story<StoryProps> = Template.bind({});
Error.args = {
  onClickHandler: () => {
    toast.error('Error Toast', { icon: <Icon icon="fsg-icon-circle-cross-solid" color={Color.RED_DEFAULT} /> });
  },
};

export const Warning: Story<StoryProps> = Template.bind({});
Warning.args = {
  onClickHandler: () => {
    toast.warning('Warning Toast', { icon: <Icon icon="fsg-icon-triangle-warning-solid" color={Color.ORANGE_DEFAULT} /> });
  },
};
