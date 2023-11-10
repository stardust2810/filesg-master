import { AxiosError, AxiosRequestConfig } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient, apiTransferServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { DownloadSaveFile } from '../../typings';

interface QueryOptions {
  enabled?: boolean;
  onError?: (err: unknown) => void;
}

export async function downloadFromS3(
  fileAssetUuids: string[],
  token?: string,
  signal?: AbortSignal,
  onDownloadProgress?: AxiosRequestConfig['onDownloadProgress'],
): Promise<DownloadSaveFile> {
  // TODO: FIRE A CALL TO LOG DOWNLOAD (actual download click or document render via query)
  const query = fileAssetUuids.join('&uuid=');

  const fetchTokenUrl = `/v1/file/${token ? 'non-singpass/' : ''}download/?uuid=${query}`;
  const fetchTokenConfig = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;
  const jwtResponse = await apiCoreServerClient.get<string>(fetchTokenUrl, { ...fetchTokenConfig, signal });
  const jwt = jwtResponse.data;

  const fileResponse = await apiTransferServerClient.get<Blob>(`/v1/file-download`, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    timeout: 5 * 60 * 1000, // 5 mins
    signal,
    onDownloadProgress,
  });

  const contentDisposition = fileResponse.headers['content-disposition'];
  const filename = contentDisposition.split('"')[1];

  return { blob: fileResponse.data, filename };
}

export function useDownloadFromS3(fileAssetUuid: string | undefined, token?: string, { enabled = true, onError }: QueryOptions = {}) {
  return useQuery<DownloadSaveFile, AxiosError<DownloadSaveFile>>(
    [QueryKey.DOWNLOAD_FILE, fileAssetUuid],
    ({ signal }) => downloadFromS3(fileAssetUuid ? [fileAssetUuid] : [], token, signal),
    {
      enabled: enabled && !!fileAssetUuid,
      onError,
    },
  );
}
