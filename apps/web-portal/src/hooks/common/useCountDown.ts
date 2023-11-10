import { differenceInSeconds } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import * as workerTimers from 'worker-timers';

let timerId: number | null;

export const useCountDown = () => {
  const [counter, setCounter] = useState(-1);
  const [fromDate, setFromDate] = useState<Date>();
  const [hasEnded, setHasEnded] = useState(false);

  const startCountDown = useCallback((from: Date) => {
    setFromDate(from);
    setCounter(-1);
    setHasEnded(false);
  }, []);

  const handleClearInterval = (id: number) => {
    workerTimers.clearInterval(id);
    timerId = null;
  };

  useEffect(() => {
    if (fromDate && counter === -1 && !hasEnded) {
      timerId = workerTimers.setInterval(() => {
        const difference = differenceInSeconds(fromDate, new Date());

        if (difference >= 0) {
          setCounter(difference);
        }

        if (difference === 0) {
          setHasEnded(true);
        }
      }, 1000);
    }

    return () => {
      if (hasEnded && timerId) {
        handleClearInterval(timerId);
      }
    };
  }, [counter, fromDate, hasEnded]);

  // another useEffect to cater for clearing interval during component unmount/count down has yet to end
  useEffect(() => {
    return () => {
      if (timerId) {
        handleClearInterval(timerId);
      }
    };
  }, []);

  return { counter, startCountDown };
};
