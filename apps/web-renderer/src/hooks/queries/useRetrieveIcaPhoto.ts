import { AgencyClientPhotoRequest, AgencyClientPhotoResponse } from '@filesg/common';
import { WrappedDocument } from '@govtechsg/open-attestation';
import { AxiosError, AxiosResponse } from 'axios';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { LtpPass } from '../../typings';
interface Props {
  onSuccess?: (data: AgencyClientPhotoResponse) => void;
  onError?: (error: AxiosError) => void;
}

export function useRetrieveIcaPhoto({ onSuccess, onError }: Props) {
  async function fetchIcaPhoto(oaDocument: WrappedDocument<LtpPass>) {
    const response = await apiCoreServerClient.post<
      AgencyClientPhotoResponse,
      AxiosResponse<AgencyClientPhotoResponse>,
      AgencyClientPhotoRequest
    >('v2/agency-client/retrieve-photo', { oaDocument: Buffer.from(JSON.stringify(oaDocument)).toString('base64') });

    return response.data;
  }

  return useMutation<AgencyClientPhotoResponse, AxiosError<AgencyClientPhotoResponse>, WrappedDocument<LtpPass>>(fetchIcaPhoto, {
    onSuccess,
    onError,
  });
}
