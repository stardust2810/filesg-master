import { getDnsDidRecords, OpenAttestationDnsDidRecord } from '@govtechsg/dnsprove';
import { useQuery } from 'react-query';

import { QueryKey } from '../../consts';

interface Props {
  location: string;
  onSuccess: (data: OpenAttestationDnsDidRecord[]) => void;
  onError: () => void;
}

export const useDnsDidRecords = ({ location, onSuccess, onError }: Props) => {
  const fetchDnsDidRecords = async (): Promise<OpenAttestationDnsDidRecord[]> => {
    return await getDnsDidRecords(location);
  };

  return useQuery([QueryKey.DNS_DID_RECORDS, { location }], fetchDnsDidRecords, {
    enabled: false,
    onSuccess,
    onError,
  });
};
