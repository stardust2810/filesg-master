import { GenerateFilesDownloadTokenResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient, apiTransferServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface DownloadResult {
  blob: Blob;
  filename: string;
}

interface QueryOptions {
  enabled?: boolean;
  onError?: (err: unknown) => void;
}

async function verifyFileDownload(token?: string) {
  const fetchTokenUrl = `/v1/file/verify/download`;
  const jwtResponse = await apiCoreServerClient.post<GenerateFilesDownloadTokenResponse>(fetchTokenUrl, { token });
  const jwt = jwtResponse.data.token;

  const fileResponse = await apiTransferServerClient.get<Blob>(`/v1/file-download/verify`, {
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    timeout: 5 * 60 * 1000, // 5 mins
  });

  const contentDisposition = fileResponse.headers['content-disposition'];
  const filename = contentDisposition.split('"')[1];

  return { blob: fileResponse.data, filename };
}

export function useVerifyFileDownload(token: string | undefined, { enabled = true, onError }: QueryOptions = {}) {
  return useQuery<DownloadResult, AxiosError>([QueryKey.DOWNLOAD_FILE, token], () => verifyFileDownload(token), {
    enabled: enabled && !!token,
    onError,
    retry: false,
  });
}
