import { FileQrCodeResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface QueryOptions {
  onError?: (err: AxiosError) => void;
}

export function useGenerateQrCode(fileAssetUuid: string, showQr?: boolean, token?: string, { onError }: QueryOptions = {}) {
  const generateQrCode = async () => {
    const url = `/v1/file/${fileAssetUuid}${token ? '/non-singpass' : ''}/generate-qr`;
    const fetchTokenConfig = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await apiCoreServerClient.get<FileQrCodeResponse>(url, fetchTokenConfig);
    return response.data;
  };

  return useQuery<FileQrCodeResponse, AxiosError>([QueryKey.VERIFY, fileAssetUuid], generateQrCode, {
    enabled: showQr,
    onError,
  });
}
