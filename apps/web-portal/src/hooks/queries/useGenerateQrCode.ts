import { FileQrCodeResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

interface QueryOptions {
  onError?: (err: AxiosError) => void;
}

export function useGenerateQrCode(fileAssetUuid: string, showQr?: boolean, token?: string, { onError }: QueryOptions = {}) {
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const generateQrCode = async () => {
    const authenticatedMedium = getRoutePath(token, isCorporateUser && isCorppassEnabled);

    const url = `/v1/file${authenticatedMedium}/${fileAssetUuid}/generate-qr`;
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
