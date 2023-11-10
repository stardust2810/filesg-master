import { useCallback, useEffect, useState } from 'react';
import * as workerTimers from 'worker-timers';

export const useTimer = (timeoutInMS: number, autoStart = false) => {
  const [timerDone, setTimerDone] = useState(false);
  const [start, setStart] = useState(false);

  const startTimer = useCallback(() => {
    setStart(true);
  }, []);

  useEffect(() => {
    if (autoStart) {
      setStart(true);
    }
  }, [autoStart]);

  useEffect(() => {
    let timerId: number | null = null;

    if (!timerDone && start) {
      timerId = workerTimers.setTimeout(() => {
        setTimerDone(true);
        setStart(false);
      }, timeoutInMS);
    }

    return () => {
      if (timerId) {
        workerTimers.clearTimeout(timerId);
      }
    };
  }, [start, timeoutInMS, timerDone]);

  return { timerDone, startTimer };
};
