import { Color, Divider, Modal, TextLink, Typography } from '@filesg/design-system';
import { forwardRef } from 'react';

import singpassLogo from '../../../../assets/logos/singpass-text-logo.svg';
import { TEST_IDS, WebPage } from '../../../../consts';
import { NonSingpassButton, SingpassButton, SingpassLogo, StyledOption } from './style';

const SINGPASS_OPTION_DESCRIPTION = 'If you are the document recipient and have a Singpass account.';
const NON_SINGPASS_OPTION_DESCRIPTION =
  'If you do not have a Singpass account or are helping someone without Singpass retrieve their document.';

interface Props {
  title?: string;
  description?: string;
  onClose: () => void;
  onSingpassButtonClick: () => void;
  onNonSingpassButtonClick?: () => void;
  showNonSingpassHelperContent?: boolean;
}

export const AuthenticationOptionModal = forwardRef<HTMLDivElement, Props>(
  ({ title = 'Verify to proceed', onClose, onSingpassButtonClick, onNonSingpassButtonClick, showNonSingpassHelperContent }: Props, ref) => {
    return (
      <Modal onBackdropClick={onClose} trapFocus ref={ref}>
        <Modal.Card>
          <Modal.Header onCloseButtonClick={onClose}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <StyledOption>
              <SingpassButton
                onClick={onSingpassButtonClick}
                data-testid={TEST_IDS.AUTH_OPTION_MODAL_SINGPASS_BUTTON}
                aria-label="Log in with Singpass"
              >
                <span>Log in with </span>
                <SingpassLogo src={singpassLogo} />
              </SingpassButton>
              <Typography variant="BODY" color={Color.GREY80} data-testid={TEST_IDS.AUTH_OPTION_MODAL_SINGPASS_OPTION_DESCRIPTION}>
                {SINGPASS_OPTION_DESCRIPTION}
              </Typography>
            </StyledOption>

            {onNonSingpassButtonClick ? (
              <>
                <Divider>OR</Divider>
                <StyledOption>
                  <NonSingpassButton
                    decoration="SOLID"
                    color="DEFAULT"
                    label="Retrieve without Singpass"
                    endIcon="sgds-icon-arrow-right"
                    onClick={onNonSingpassButtonClick}
                    data-testid={TEST_IDS.NON_SINGPASS_BUTTON}
                    fullWidth
                  />
                  <Typography variant="BODY" color={Color.GREY80} data-testid={TEST_IDS.NON_SINGPASS_OPTION_DESCRIPTION}>
                    {NON_SINGPASS_OPTION_DESCRIPTION}
                  </Typography>
                </StyledOption>
              </>
            ) : showNonSingpassHelperContent ? (
              <Typography variant="BODY">
                For users without Singpass, you may visit FileSG's{' '}
                <TextLink onClick={onClose} font="BODY" to={`${WebPage.RETRIEVE}`} type="LINK">
                  Retrieve Your Documents
                </TextLink>{' '}
                page to view and download your documents instead.
              </Typography>
            ) : null}
          </Modal.Body>
        </Modal.Card>
      </Modal>
    );
  },
);
