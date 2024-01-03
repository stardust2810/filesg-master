import { Color, Divider, Modal, TextLink, Typography } from '@filesg/design-system';
import { forwardRef, Fragment } from 'react';

import singpassLogo from '../../../../assets/logos/singpass-text-logo.svg';
import { TEST_IDS, WebPage } from '../../../../consts';
import { StypedTextLink } from '../singpass-authentication-option-modal/style';
import { CorppassButton, NonSingpassButton, SingpassButton, SingpassLogo, StyledOption } from './style';

const SINGPASS_OPTION_DESCRIPTION = 'If you are the document recipient and have a Singpass account.';
const NON_SINGPASS_OPTION_DESCRIPTION =
  'If you do not have a Singpass account or are helping someone without Singpass retrieve their document.';
const CORPPASS_OPTION_DESCRIPTION =
  "If you have access to retrieve your company's documents and have a Singpass account. Need help? Refer to ";

interface Props {
  title?: string;
  description?: string;
  onClose: () => void;
  onSingpassButtonClick?: () => void;
  onNonSingpassButtonClick?: () => void;
  onCorppassButtonClick?: () => void;
  showNonSingpassHelperContent?: boolean;
}

export const AuthenticationOptionModal = forwardRef<HTMLDivElement, Props>(
  (
    {
      title = 'Verify to proceed',
      onClose,
      onSingpassButtonClick,
      onNonSingpassButtonClick,
      showNonSingpassHelperContent,
      onCorppassButtonClick,
    }: Props,
    ref,
  ) => {
    const CitizenAuthenticationOptionModal = () => (
      <Fragment>
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
          <Fragment>
            <Divider>OR</Divider>
            <NonSingpassAuthenticationOptionModal />
          </Fragment>
        ) : showNonSingpassHelperContent ? (
          <Typography variant="BODY">
            For users without Singpass, you may visit FileSG's{' '}
            <TextLink onClick={onClose} font="BODY" to={`${WebPage.RETRIEVE}`} type="LINK">
              Retrieve Your Documents
            </TextLink>{' '}
            page to view and download your documents instead.
          </Typography>
        ) : null}
      </Fragment>
    );

    const NonSingpassAuthenticationOptionModal = () => (
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
    );

    const CorppassAuthenticationOptionModal = () => (
      <StyledOption>
        <CorppassButton
          decoration="SOLID"
          color="DEFAULT"
          label="For Business"
          endIcon="sgds-icon-arrow-right"
          onClick={onCorppassButtonClick}
          data-testid={TEST_IDS.CORPPASS_BUTTON}
          fullWidth
        />
        <Typography variant="BODY" color={Color.GREY80} data-testid={TEST_IDS.CORPPASS_OPTION_DESCRIPTION}>
          {CORPPASS_OPTION_DESCRIPTION}
          <StypedTextLink onClick={onClose} font="BODY" to={`${WebPage.FAQ}${WebPage.RETRIEVING_BUSINESS_DOCUMENTS}`} type="LINK">
            FAQ - Retrieving business documents
          </StypedTextLink>
        </Typography>
      </StyledOption>
    );

    return (
      <Modal onBackdropClick={onClose} trapFocus ref={ref}>
        <Modal.Card>
          <Modal.Header onCloseButtonClick={onClose}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{onCorppassButtonClick ? <CorppassAuthenticationOptionModal /> : <CitizenAuthenticationOptionModal />}</Modal.Body>
        </Modal.Card>
      </Modal>
    );
  },
);
