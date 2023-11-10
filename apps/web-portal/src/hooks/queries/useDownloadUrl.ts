import axios from 'axios';
import { useQuery } from 'react-query';

import { QueryKey } from '../../consts';

interface QueryOptions {
  enabled?: boolean;
  cacheTime?: number;
  onError?: (err: unknown) => void;
}

const downloadUrl = async (source: string): Promise<any> => {
  return (
    await axios.get(source, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).data;
};

export const useDownloadUrl = (source: string, { enabled, cacheTime, onError }: QueryOptions) => {
  return useQuery([QueryKey.DOWNLOAD, source], () => downloadUrl(source), {
    enabled,
    cacheTime,
    onError,
  });
};
