import { useCallback, useEffect, useState } from 'react';
import * as workerTimers from 'worker-timers';

export const useWakeUpEvent = (isActive: boolean) => {
  const [isAwake, setIsAwake] = useState(false);

  const resetIsAwake = useCallback(() => {
    setIsAwake(false);
  }, []);

  useEffect(() => {
    if (!isActive || isAwake) {
      return;
    }

    const TIMEOUT = 2000;
    const BUFFER = 2000;
    let lastKnownCurrTime = new Date().getTime();

    const wakeInterval = workerTimers.setInterval(function () {
      const currentTime = new Date().getTime();
      if (currentTime > lastKnownCurrTime + TIMEOUT + BUFFER) {
        setIsAwake(true);
      }
      lastKnownCurrTime = currentTime;
    }, TIMEOUT);

    return () => {
      workerTimers.clearInterval(wakeInterval);
    };
  }, [isActive, isAwake]);

  return { isAwake, resetIsAwake };
};
