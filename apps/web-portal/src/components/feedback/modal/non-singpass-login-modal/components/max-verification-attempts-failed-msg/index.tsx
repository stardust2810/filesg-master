import React from 'react';

import { StyledContainer } from './style';

export const MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_TEXT = [
  'You have reached the limit of verification attempts.',
  'To retrieve your documents, please contact the issuing agency directly.',
];

const MaxVerificationAttemptsFailedMsg = (): JSX.Element => {
  return (
    <StyledContainer>
      {MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_TEXT.map((row, index) => (
        <div key={`max-verification-attempt-failed-msg-${index}`}>{row}</div>
      ))}
    </StyledContainer>
  );
};

export default MaxVerificationAttemptsFailedMsg;
