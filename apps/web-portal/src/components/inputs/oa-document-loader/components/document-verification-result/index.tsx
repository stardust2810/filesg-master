import { REVOCATION_TYPE, VerificationResult } from '@filesg/common';
import { Bold, Color, FSG_DEVICES, Icon, RESPONSIVE_VARIANT, TextButton, Typography, useShouldRender } from '@filesg/design-system';
import { v2 } from '@govtechsg/open-attestation';
import { useTransition } from '@react-spring/web';
import { useRef, useState } from 'react';

import { VerificationResultMessage } from '../verification-result-message';
import {
  IssuerIdentityContainer,
  StyledAllMessagesWrapper,
  StyledAnimatedLoaderIcon,
  StyledDetailsContainer,
  StyledMessageWrapper,
  StyledResultsWrapper,
  StyledSummaryContainter,
  StyledTextContainer,
  StyledWrapper,
} from './style';

export const TEST_IDS = {
  ISSUER_IDENTITY_CONTAINER: 'issuer-identity-container',
  ISSUER: 'issuer',
  VERIFICIATION_RESULTS_SECTION: 'verification-results-section',
  VERIFICATION_INDIVIDUAL_RESULTS_CONTAINER: 'verification-individual-results-container',
  VERIFICATION_RESULT: 'verification-result',
};

interface Props {
  issuers?: v2.Issuer[];
  isVerifying: boolean;
  isExpandable?: boolean;
  verificationResult: VerificationResult | null;
}

export const VERIFICATION_RESULT_MESSAGE = {
  documentStatus: {
    verifying: 'Checking if document was issued',
    success: 'Document has been issued',
    failure: 'Document has not been issued',
  },
  documentIntegrity: {
    verifying: 'Checking if document has been tampered with',
    success: 'Document has not been tampered with',
    failure: 'Document has been tampered with',
  },
  issuerIdentity: {
    verifying: 'Checking issuer identity',
    success: 'Issued by Singapore Government',
    failure: "Document's issuer has not been identified",
  },
};

export const DocumentVerificationResult = ({ issuers, isVerifying, isExpandable = true, verificationResult }: Props) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  const detailsContainerRef = useRef<HTMLDivElement>(null);
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const transition = useTransition(isExpanded, {
    from: { y: isExpandable ? '-100%' : '0' },
    enter: { y: '0' },
    leave: { y: isExpandable ? '-100%' : '0' },
  });

  const isValid = !!verificationResult?.overall;

  const getVerificationResultHeader = () => {
    if (isSmallerThanSmallTablet) {
      return isValid ? 'Valid' : 'Invalid';
    }
    return `This document is ${isValid ? 'valid' : 'invalid'}`;
  };

  return (
    <StyledWrapper>
      <StyledSummaryContainter $isExpandable={isExpandable} isLoading={isVerifying} isValid={isValid}>
        <StyledTextContainer>
          {isVerifying ? (
            <StyledAnimatedLoaderIcon icon="fsg-icon-loading-solid" color={Color.GREY80} />
          ) : (
            <Icon
              icon={isValid ? 'fsg-icon-circle-check-solid' : 'fsg-icon-circle-cross-solid'}
              color={isValid ? Color.GREEN_DEFAULT : Color.RED_DEFAULT}
            />
          )}

          <Typography variant={isSmallerThanSmallTablet ? 'SMALL' : 'PARAGRAPH'} bold="FULL">
            {isVerifying ? 'Checking document validity' : getVerificationResultHeader()}
          </Typography>
        </StyledTextContainer>

        {!isVerifying && isExpandable && (
          <TextButton
            variant={isSmallerThanSmallTablet ? 'SMALL' : 'BODY'}
            color={Color.GREY60}
            label="Learn more"
            endIcon={isExpanded ? 'sgds-icon-chevron-up' : 'sgds-icon-chevron-down'}
            aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
            onClick={() => setIsExpanded((prevState) => !prevState)}
          />
        )}
      </StyledSummaryContainter>

      {isVerifying
        ? !isExpandable && (
            <StyledDetailsContainer $isVerifying={isVerifying} $isExpandable={isExpandable}>
              <StyledResultsWrapper data-testid={TEST_IDS.VERIFICATION_INDIVIDUAL_RESULTS_CONTAINER}>
                {Object.entries(VERIFICATION_RESULT_MESSAGE).map((resultType, index) => {
                  const [, messages] = resultType;

                  return (
                    <StyledMessageWrapper
                      key={`${TEST_IDS.VERIFICATION_RESULT}-${index}`}
                      data-testid={`${TEST_IDS.VERIFICATION_RESULT}-${index}`}
                    >
                      <VerificationResultMessage status={'VERIFYING'} text={messages.verifying} />
                    </StyledMessageWrapper>
                  );
                })}
              </StyledResultsWrapper>
            </StyledDetailsContainer>
          )
        : transition(
            (style, item) =>
              item && (
                <StyledDetailsContainer
                  $isExpandable={isExpandable}
                  $isVerifying={isVerifying}
                  data-testid={TEST_IDS.VERIFICIATION_RESULTS_SECTION}
                  ref={detailsContainerRef}
                  style={style}
                >
                  <StyledResultsWrapper>
                    {issuers && issuers.length > 0 && (
                      <IssuerIdentityContainer data-testid={TEST_IDS.ISSUER_IDENTITY_CONTAINER}>
                        <Typography
                          variant={isSmallerThanSmallTablet ? 'SMALL' : 'PARAGRAPH'}
                          data-testid={`${TEST_IDS.ISSUER_IDENTITY_CONTAINER}-title`}
                        >
                          Issued by&nbsp;
                          <Bold type="FULL">
                            {issuers[0].identityProof?.location} ({issuers[0].name})
                          </Bold>
                        </Typography>
                      </IssuerIdentityContainer>
                    )}

                    <StyledAllMessagesWrapper data-testid={TEST_IDS.VERIFICATION_INDIVIDUAL_RESULTS_CONTAINER}>
                      {Object.entries(VERIFICATION_RESULT_MESSAGE).map((resultType, index) => {
                        const [verificationType, messages] = resultType;
                        const isSuccess = verificationResult && verificationResult[verificationType];

                        let text = '';

                        if (isSuccess) {
                          text = messages.success;
                        } else {
                          if (verificationType === 'documentStatus' && verificationResult?.revocationType) {
                            text = messages.success.replace(
                              verificationResult.revocationType === REVOCATION_TYPE.EXPIRED ? 'been issued' : 'issued',
                              verificationResult.revocationType,
                            );
                          } else {
                            text = messages.failure;
                          }
                        }

                        return (
                          <StyledMessageWrapper
                            key={`${TEST_IDS.VERIFICATION_RESULT}-${index}`}
                            data-testid={`${TEST_IDS.VERIFICATION_RESULT}-${index}`}
                          >
                            <VerificationResultMessage status={isSuccess ? 'SUCCESS' : 'FAILURE'} text={text} />
                          </StyledMessageWrapper>
                        );
                      })}
                    </StyledAllMessagesWrapper>
                  </StyledResultsWrapper>
                </StyledDetailsContainer>
              ),
          )}
    </StyledWrapper>
  );
};
