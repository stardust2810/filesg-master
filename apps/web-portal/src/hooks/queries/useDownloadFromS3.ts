import { GenerateFilesDownloadTokenResponse } from '@filesg/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient, apiTransferServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { selectIsCorporateUser } from '../../store/slices/session';
import { DownloadSaveFile } from '../../typings';
import { useAppSelector } from '../common/useSlice';

interface QueryOptions {
  enabled?: boolean;
  onError?: (err: unknown) => void;
}

export async function downloadFromS3(
  fileAssetUuids: string[],
  token?: string,
  signal?: AbortSignal,
  onDownloadProgress?: AxiosRequestConfig['onDownloadProgress'],
  isCorporateUser?: boolean,
): Promise<DownloadSaveFile> {
  const getAuthenticatedURL = () => `/v1/file/${isCorporateUser ? 'corppass/' : ''}generate-download-token`;

  // TODO: FIRE A CALL TO LOG DOWNLOAD (actual download click or document render via query)
  const fetchTokenUrl = token ? `/v1/file/non-singpass/generate-download-token` : getAuthenticatedURL();
  const fetchTokenConfig = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;
  const jwtResponse = await apiCoreServerClient.post<GenerateFilesDownloadTokenResponse>(
    fetchTokenUrl,
    { uuids: fileAssetUuids },
    { ...fetchTokenConfig, signal },
  );
  const jwt = jwtResponse.data.token;

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
  const isCorporateUser = useAppSelector(selectIsCorporateUser);

  return useQuery<DownloadSaveFile, AxiosError<DownloadSaveFile>>(
    [QueryKey.DOWNLOAD_FILE, fileAssetUuid],
    ({ signal }) => downloadFromS3(fileAssetUuid ? [fileAssetUuid] : [], token, signal, undefined, isCorporateUser),
    {
      enabled: enabled && !!fileAssetUuid,
      onError,
    },
  );
}
