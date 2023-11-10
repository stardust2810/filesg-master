import { CertificateVerificationResponse } from '@filesg/common';
import { v2 } from '@govtechsg/open-attestation';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';

interface QueryOptions {
  onSuccess?: (
    data: CertificateVerificationResponse,
    variables: v2.SignedWrappedDocument<v2.OpenAttestationDocument>,
    context: unknown,
  ) => void;
  onError?: (error: unknown, variables: v2.SignedWrappedDocument<v2.OpenAttestationDocument>, context: unknown) => void;
}

export const useOaVerification = (options: QueryOptions = {}) => {
  const verifyOa = async (oaDocument: v2.SignedWrappedDocument<v2.OpenAttestationDocument>) => {
    try {
      const response = await apiCoreServerClient.post<CertificateVerificationResponse>('v1/open-attestation/verify', {
        oaDocument: Buffer.from(JSON.stringify(oaDocument)).toString('base64'),
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify OA doc');
    }
  };

  return useMutation(verifyOa, {
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
};
