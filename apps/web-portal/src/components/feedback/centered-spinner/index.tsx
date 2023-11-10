import { Spinner } from '@filesg/design-system';

import { SpinnerWrapper } from './style';

type Props = {
  mainMessage?: string;
  secondaryMessage?: string;
};

export const CenteredSpinner = ({ mainMessage, secondaryMessage }: Props) => {
  return (
    <SpinnerWrapper>
      <Spinner mainMessage={mainMessage} secondaryMessage={secondaryMessage} />
    </SpinnerWrapper>
  );
};
