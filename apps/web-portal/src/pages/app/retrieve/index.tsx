import { DATE_FORMAT_PATTERNS, EXCEPTION_ERROR_CODE, ValidateActivityNonSingpassRetrievableResponse } from '@filesg/common';
import {
  Divider,
  Level1Accordion,
  PublicPageDescriptor,
  removeWhitelistedUnicode,
  sendToastMessage,
  TextInput,
  TextLink,
  Typography,
} from '@filesg/design-system';
import { isValid, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import lightBulbWhiteImage from '../../../assets/images/common/light-bulb-white.svg';
import RetrieveDocumentsImg from '../../../assets/images/retrieve/retrieve-header.svg';
import { ImageTitleBar } from '../../../components/data-display/image-title-bar';
import AuthenticationModal from '../../../components/feedback/modal/authentication-modal';
import PublicPageContainer from '../../../components/layout/public-page-container';
import { REDIRECTION_PATH_KEY, WebPage } from '../../../consts';
import { TRAFFIC_SOURCE, TRAFFIC_SOURCE_QUERY_PARAM, WOGAA_TRACKING_ID } from '../../../consts/analytics';
import { FORM_IDS } from '../../../consts/identifiers';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { useValidateActivityNonSingpassRetrieval } from '../../../hooks/queries/useValidateActivityNonSingpassRetrieval';
import { setFirstFaInput, setIsActivityBannedFromNonSingpassVerification } from '../../../store/slices/non-singpass-session';
import { selectIsUserLoggedIn } from '../../../store/slices/session';
import { isFileSGError, isFileSGErrorType, trackWogaaTransaction } from '../../../utils/common';
import { FaqListContent } from '../faq/components/faq-list-content';
import { RETRIEVE_FAQ_OBJECT } from './const';
import { StyledFaqContainer, StyledForm, StyledHeader, StyledWrapper } from './style';

// Meta Tags
const PAGE_TITLE = 'Retrieve Your Documents';
const PAGE_DESCRIPTION = 'Access documents issued by government agencies through FileSG';

// NOTE: In this page, the transaction ID displayed for citizen users refer to the activityUuid
const RETRIEVAL_ERROR_MESSAGE = 'Please enter a valid Transaction ID';

const validateTransactionId = (transactionId: string) => {
  // Validating date before using regex. This is to handle cases like 31st of April
  if (!transactionId.split('-')[1]) {
    return false;
  }
  if (
    transactionId.split('-')[1].length === 8 &&
    !isValid(parse(transactionId.split('-')[1], DATE_FORMAT_PATTERNS.TRANSACTION_DATE, new Date()))
  ) {
    return false;
  }
  return (
    /^activity-[0-9]{13}\b-[0-9a-f]{16}\b$/.test(transactionId) ||
    /^FSG-(20)\d\d(0[0-9]|1[012])(0[0-9]|[12][0-9]|3[01])\b-[0-9a-f]{16}\b$/.test(transactionId)
  );
};

interface FormInput {
  transactionId: string;
}

const Retrieve = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    setValue,
    formState: { isDirty, errors },
  } = useForm<FormInput>({ mode: 'onSubmit', reValidateMode: 'onChange' });
  const transactionId = watch('transactionId');

  usePageTitle(PAGE_TITLE);
  usePageDescription(PAGE_DESCRIPTION);

  const [activityNotFound, setActivityNotFound] = useState(false);
  const [showAuthenticationModal, setShowAuthenticationModal] = useState(false);

  useEffect(() => {
    if (searchParams.get(TRAFFIC_SOURCE_QUERY_PARAM) === TRAFFIC_SOURCE.EMAIL) {
      trackWogaaTransaction('START', WOGAA_TRACKING_ID.ONBOARD_VIA_EMAIL_LINK);
    }
  }, [searchParams]);

  // -----------------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------------
  const onSubmitHandler = () => {
    setActivityNotFound(false); //reset the error field with each submit
    resetField('transactionId', { keepDirty: false, defaultValue: transactionId });
    validateActivity();
  };

  const onChangeHandler = (e) => {
    let parsedValue = ((e.target.value as string) ?? '').trim();
    parsedValue = removeWhitelistedUnicode(parsedValue);
    setValue('transactionId', parsedValue);
    if (isDirty) {
      setActivityNotFound(false);
    }
  };

  const onActivityValidationSuccess = (data: ValidateActivityNonSingpassRetrievableResponse) => {
    if (isUserLoggedIn) {
      navigate(`${WebPage.ACTIVITIES}/${transactionId}`);
      return;
    }

    dispatch(
      setFirstFaInput({
        activityUuid: transactionId,
        uin: '',
        dob: { day: '', month: '', year: '' },
      }),
    );

    dispatch(setIsActivityBannedFromNonSingpassVerification(data.isBannedFromNonSingpassVerification));

    sessionStorage.setItem(REDIRECTION_PATH_KEY, `${WebPage.ACTIVITIES}/${transactionId}`);
    setShowAuthenticationModal(true);
  };

  const onActivityValidationError = (error: unknown) => {
    if (isFileSGErrorType(error, EXCEPTION_ERROR_CODE.NOT_FOUND)) {
      setActivityNotFound(true);
    }

    if (!isFileSGError(error)) {
      sendToastMessage('Server error. Please try again later.', 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  const {
    refetch: validateActivity,
    isFetching: isFetchingValidateActivity,
    data: validateActivityData,
  } = useValidateActivityNonSingpassRetrieval(transactionId, {
    onSuccess: onActivityValidationSuccess,
    onError: onActivityValidationError,
  });

  return (
    <>
      <StyledWrapper>
        <PublicPageDescriptor title={PAGE_TITLE} description={PAGE_DESCRIPTION} image={RetrieveDocumentsImg} />
        <PublicPageContainer>
          <>
            <StyledHeader>
              <Typography variant="H3" bold="FULL">
                Provide your Transaction ID to view your document(s)
              </Typography>
            </StyledHeader>
            <StyledForm
              onSubmit={handleSubmit(onSubmitHandler)}
              style={{ maxWidth: '584px' }}
              id={FORM_IDS.RETRIEVAL_ACTIVITY_ID_VERIFICATION}
            >
              <TextInput
                label="Transaction ID"
                type="text"
                fieldId="transactionId"
                aria-label="Enter your transaction ID"
                placeholder="e.g. FSG-20230101-XXXXXXXXXXXXXXXX"
                {...register('transactionId', { validate: validateTransactionId, onChange: onChangeHandler })}
                errorMessage={errors.transactionId || activityNotFound ? RETRIEVAL_ERROR_MESSAGE : undefined}
                hasSubmitButton={true}
                isSubmitButtonLoading={isFetchingValidateActivity}
              />
            </StyledForm>

            <StyledFaqContainer>
              <ImageTitleBar imageSrc={lightBulbWhiteImage} aria-label="FAQ on accessing your documents" title="Accessing your documents" />
              <Divider />
              {RETRIEVE_FAQ_OBJECT.map((faq, index) => (
                <Level1Accordion key={index} title={faq.title} isInitiallyOpen={true}>
                  <FaqListContent answerContents={faq.content} />
                </Level1Accordion>
              ))}
            </StyledFaqContainer>

            <Typography variant="PARAGRAPH">
              View{' '}
              <TextLink font="PARAGRAPH" type="LINK" to={WebPage.FAQ + WebPage.RETRIEVING_YOUR_DOCUMENTS}>
                FAQ - Retrieving your documents
              </TextLink>{' '}
              for more details.
            </Typography>
          </>
        </PublicPageContainer>
      </StyledWrapper>
      {showAuthenticationModal && validateActivityData && (
        <AuthenticationModal
          showSingpassOptionsOnly={false}
          onCloseModal={() => setShowAuthenticationModal(false)}
          onNonSingpassLogin={validateActivityData.isNonSingpassRetrievable ? () => null : undefined}
        />
      )}
    </>
  );
};

export default Retrieve;
