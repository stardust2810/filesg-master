import { TemplateContent } from '@filesg/common';
import { Button, DynamicContent, FileSGProps, Modal, sendToastMessage, Typography } from '@filesg/design-system';
import { useForm } from 'react-hook-form';

import { TEST_IDS } from '../../../../consts';
import { BUTTON_IDS } from '../../../../consts/identifiers';
import { useAppSelector } from '../../../../hooks/common/useSlice';
import { useAcknowledgeActivity } from '../../../../hooks/queries/useAcknowledgeActivity';
import { selectContentRetrievalToken } from '../../../../store/slices/non-singpass-session';
import { StyledCheckbox, StyledFooterButtonGroup, StyledModalBody, StyledModalFooter, StyledModalHeader } from './style';

interface Props extends FileSGProps {
  activityUuid: string;
  acknowledgementMessage: TemplateContent | null;
  acknowledgedAt: Date | null;
  onClose: () => void;
}

const POST_ACKNOWLEDGEMENT_MODAL_TITLE = 'Terms and Conditions';
const PRE_ACKNOWLEDGEMENT_MODAL_TITLE = 'Acknowledgement of Terms and Conditions';
const DEFAULT_ACKNOWLEDGEMENT_MESSAGE = 'I acknowledge that I have received the files.';
const ACKNOWLEDGEMENT_CANCELLATION_BUTTON_LABEL = 'Cancel';
const ACKNOWLEDGEMENT_CONFIRMATION_BUTTON_LABEL = 'Agree';
const ACKNOWLEDGEMENT_CHECKBOX_LABEL = 'I have read and understood the Terms and Conditions.';
const ERROR_TITLE = 'Unable to acknowledge receipt';
const ERROR_MESSAGE = 'Please reload this page and try again.';

const DefaultAcknowledgementMessage = () => <Typography variant="BODY">{DEFAULT_ACKNOWLEDGEMENT_MESSAGE}</Typography>;

export const AcknowledgementModal = ({ acknowledgementMessage, onClose, activityUuid, acknowledgedAt, ...rest }: Props) => {
  const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);

  // ===========================================================================
  // Effect
  // ===========================================================================

  const { isLoading, mutate: acknowledgeActivity } = useAcknowledgeActivity({
    activityUuid,
    onSuccess: onClose,
    onError: () => {
      sendToastMessage({ title: ERROR_TITLE, description: ERROR_MESSAGE }, 'error');
      onClose();
    },
    token: contentRetrievalToken,
  });
  // ===========================================================================
  // React Hook Form
  // ===========================================================================
  const {
    register: registerAcknowledgement,
    handleSubmit: handleFormSubmit,
    formState: { isValid },
  } = useForm<{ acknowledged: boolean }>({
    mode: 'onChange',
  });

  // ===========================================================================
  // Handler
  // ===========================================================================

  function onSubmitForm() {
    acknowledgeActivity();
  }
  return (
    <Modal onBackdropClick={onClose} size="MEDIUM" data-testid={rest['data-testid'] ?? TEST_IDS.INFORMATION_MODAL}>
      <Modal.Card>
        <StyledModalHeader onCloseButtonClick={onClose}>
          <Modal.Title>{acknowledgedAt ? POST_ACKNOWLEDGEMENT_MODAL_TITLE : PRE_ACKNOWLEDGEMENT_MODAL_TITLE}</Modal.Title>
        </StyledModalHeader>
        <StyledModalBody>
          {acknowledgementMessage ? <DynamicContent dynamicContent={acknowledgementMessage} /> : <DefaultAcknowledgementMessage />}
        </StyledModalBody>
        {!acknowledgedAt && (
          <StyledModalFooter>
            <StyledCheckbox
              label={ACKNOWLEDGEMENT_CHECKBOX_LABEL}
              {...registerAcknowledgement('acknowledged', {
                required: true,
              })}
            />
            <StyledFooterButtonGroup>
              <Button
                type="button"
                color="DEFAULT"
                decoration="GHOST"
                label={ACKNOWLEDGEMENT_CANCELLATION_BUTTON_LABEL}
                onClick={onClose}
                data-testid={TEST_IDS.CANCEL_ACKNOWLEDGEMENT_BUTTON}
                id={BUTTON_IDS.ACKNOWLEDGEMENT_CANCELLATION_BUTTON_ID}
              />
              <Button
                type="submit"
                label={ACKNOWLEDGEMENT_CONFIRMATION_BUTTON_LABEL}
                disabled={!isValid || isLoading}
                onClick={handleFormSubmit(onSubmitForm)}
                data-testid={TEST_IDS.CONFIRM_ACKNOWLEDGEMENT_BUTTON}
                id={BUTTON_IDS.ACKNOWLEDGEMENT_CONFIRMATION_BUTTON_ID}
              />
            </StyledFooterButtonGroup>
          </StyledModalFooter>
        )}
      </Modal.Card>
    </Modal>
  );
};
