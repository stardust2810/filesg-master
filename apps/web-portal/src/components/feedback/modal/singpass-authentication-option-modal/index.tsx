import { Button, Color, Divider, Modal, Typography } from '@filesg/design-system';
import { forwardRef } from 'react';

import { TEST_IDS, WebPage } from '../../../../consts';
import { StyledOption, StypedTextLink } from './style';

interface Props {
  title?: string;
  description?: string;
  onClose: () => void;
  onSingpassButtonClick: () => void;
  onForBusinessesButtonClick: () => void;
}

export const SingpassAuthenticationOptionModal = forwardRef<HTMLDivElement, Props>(
  ({ title = 'Log in with Singpass', onClose, onSingpassButtonClick, onForBusinessesButtonClick }: Props, ref) => {
    const FOR_INDIVIDUALS_OPTION_DESCRIPTION = (
      <>
        Access documents issued to you. If you do not have Singpass, retrieve your documents via the{' '}
        <StypedTextLink onClick={onClose} font="BODY" to={`${WebPage.RETRIEVE}`} type="LINK">
          Retrieve Your Documents
        </StypedTextLink>{' '}
        page instead.
      </>
    );

    const FOR_BUSINESSES_OPTION_DESCRIPTION = (
      <>
        Access documents issued to your company. Need help? Refer to{' '}
        <StypedTextLink onClick={onClose} font="BODY" to={`${WebPage.FAQ}${WebPage.RETRIEVING_BUSINESS_DOCUMENTS}`} type="LINK">
          FAQ - Retrieving business documents
        </StypedTextLink>
        .
      </>
    );

    return (
      <Modal onBackdropClick={onClose} trapFocus ref={ref}>
        <Modal.Card>
          <Modal.Header onCloseButtonClick={onClose}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <StyledOption>
              <Button
                decoration="SOLID"
                color="PRIMARY"
                label="For Individuals"
                endIcon="sgds-icon-arrow-right"
                onClick={onSingpassButtonClick}
                data-testid={TEST_IDS.AUTH_OPTION_MODAL_SINGPASS_BUTTON}
                fullWidth
              />
              <Typography variant="BODY" color={Color.GREY80} data-testid={TEST_IDS.AUTH_OPTION_MODAL_SINGPASS_OPTION_DESCRIPTION}>
                {FOR_INDIVIDUALS_OPTION_DESCRIPTION}
              </Typography>
            </StyledOption>

            <Divider>OR</Divider>
            <StyledOption>
              <Button
                disabled={false} // TODO: until mock corppass login is ready
                decoration="SOLID"
                color="DEFAULT"
                label="For Businesses"
                endIcon="sgds-icon-arrow-right"
                onClick={onForBusinessesButtonClick}
                data-testid={TEST_IDS.CORPPASS_BUTTON}
                fullWidth
              />
              <Typography variant="BODY" color={Color.GREY80} data-testid={TEST_IDS.CORPPASS_OPTION_DESCRIPTION}>
                {FOR_BUSINESSES_OPTION_DESCRIPTION}
              </Typography>
            </StyledOption>
          </Modal.Body>
        </Modal.Card>
      </Modal>
    );
  },
);
