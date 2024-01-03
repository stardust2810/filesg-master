import { useArgs } from '@storybook/client-api';
import { Meta, Story } from '@storybook/react';

import { Button } from '../../inputs/button';
import { Modal, ModalProps } from '.';

interface CustomTemplateProps {
  allowHide: boolean;
}
type StoryProps = ModalProps & CustomTemplateProps;

export default {
  title: 'Components/Feedback/Modal',
  component: Modal,
  argTypes: {
    show: {
      description: 'Show modal',
    },
    size: {
      description: 'Size of modal',
      table: {
        defaultValue: { summary: 'MEDIUM' },
      },
    },
    onBackdropClick: {
      description: 'onBackdropClick callback',
      table: {
        action: 'clicked',
      },
    },
    // this is not modal props but story props to toggle between templates
    allowHide: {
      table: {
        disable: true,
      },
    },
  },
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args): JSX.Element => {
  const [_, updateArgs] = useArgs();

  const onHideHandler = () => {
    updateArgs({ show: false });
  };

  return (
    <>
      <Button label="Open modal" onClick={() => updateArgs({ show: true })} />
      {_.show && (
        <Modal onBackdropClick={args.allowHide ? onHideHandler : undefined} {...args}>
          <Modal.Card>
            <Modal.Header onCloseButtonClick={onHideHandler}>
              <Modal.Title>Header</Modal.Title>
            </Modal.Header>
            <Modal.Body>Body</Modal.Body>
            <Modal.Footer>Footer</Modal.Footer>
          </Modal.Card>
        </Modal>
      )}
    </>
  );
};

export const Basic: Story<StoryProps> = Template.bind({});
Basic.args = {
  allowHide: false,
  size: 'MEDIUM',
};

export const CloseOnBackdropClick: Story<StoryProps> = Template.bind({});
CloseOnBackdropClick.args = {
  allowHide: true,
};
