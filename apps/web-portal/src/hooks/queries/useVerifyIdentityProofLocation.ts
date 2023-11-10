import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface Props {
  location: string;
}

export const useVerifyIdentityProofLocation = ({ location }: Props) => {
  const verifyIdentityProofLocation = async () => {
    if (location) {
      const response = await apiCoreServerClient.get<boolean>(`/v1/open-attestation/verify-identity-proof-location/${location}`);
      return response.data;
    }
    return null;
  };

  return useQuery([QueryKey.VERIFY_IDENTITY_PROOF_LOCATION, location], verifyIdentityProofLocation, { staleTime: 15 * 60 * 1000 });
};
