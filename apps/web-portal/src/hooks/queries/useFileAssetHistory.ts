import { FileHistoryDisplayResponse, PaginationOptions } from '@filesg/common';
import { InfiniteData, useInfiniteQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface QueryOptions {
  fileAssetId: string;
  onSuccess?: (data: InfiniteData<FileHistoryDisplayResponse>) => void;
}

export const useFileAssetHistory = ({ limit }: PaginationOptions, { fileAssetId, onSuccess }: QueryOptions, token?: string) => {
  const fetchFileAssetHistory = async ({ pageParam = 1 }) => {
    const url = `/v1/file/${token ? 'non-singpass/' : ''}history/${fileAssetId}?page=${pageParam}&limit=${limit}`;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await apiCoreServerClient.get<FileHistoryDisplayResponse>(url, config);
    // await new Promise((r) => setTimeout(r, 5000));
    // return { fileHistory: [], totalRecords: 0, nextPage: undefined };
    return response.data;
  };

  return useInfiniteQuery([QueryKey.FILE_HISTORY, fileAssetId, limit], fetchFileAssetHistory, {
    onSuccess,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
