import axios, { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { QueryKey } from '../consts/queryKey';

interface MaintenanceJsonData {
  startTime: string;
  endTime: string;
}

interface ActiveMaintenanceDuration {
  startTime: Date | null;
  endTime: Date | null;
}

const NO_DURATION = {
  startTime: null,
  endTime: null,
};

export const useActiveMaintenanceDuration = () => {
  const getActiveMaintenanceDuration = async () => {
    const res = await axios.get<MaintenanceJsonData>('/config/maintenance.json', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { startTime, endTime } = res.data;

    if (!startTime || !endTime) {
      return NO_DURATION;
    }

    const today = new Date().getTime();
    const dateStartTime = new Date(startTime);
    const dateEndTime = new Date(endTime);

    const isDurationActive = dateStartTime.getTime() <= today && today <= dateEndTime.getTime();

    if (!isDurationActive) {
      return NO_DURATION;
    }

    return {
      startTime: dateStartTime,
      endTime: dateEndTime,
    };
  };

  return useQuery<ActiveMaintenanceDuration, AxiosError>([QueryKey.ACTIVE_MAINTENANCE_DURATION], getActiveMaintenanceDuration);
};
