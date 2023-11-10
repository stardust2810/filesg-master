import { DELAY_IN_SHOWING_LOADING_MS } from '../../../consts';
import { useTimer } from '../../../hooks/common/useTimer';
import { CenteredSpinner } from '../centered-spinner';

export const SuspenseFallback = (): JSX.Element | null => {
  const { timerDone: isTimeoutDone } = useTimer(DELAY_IN_SHOWING_LOADING_MS, true);

  if (!isTimeoutDone) {
    return null;
  }

  return <CenteredSpinner />;
};
