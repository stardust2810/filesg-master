import { Color, Typography } from '@filesg/design-system';

import { StyledContainer } from './style';

interface Props {
  message: string[] | JSX.Element;
}

const VerificationErrorMessageContainer = ({ message }: Props): JSX.Element => {
  return (
    <StyledContainer>
      {Array.isArray(message)
        ? message.map((row, index) => (
            <Typography variant="BODY" color={Color.GREY80} key={`verification-error-msg-${index}`}>
              {row}
            </Typography>
          ))
        : message}
    </StyledContainer>
  );
};

export default VerificationErrorMessageContainer;
