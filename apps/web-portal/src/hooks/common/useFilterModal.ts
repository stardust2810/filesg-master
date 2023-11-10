import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AGENCY_CODE_FILTER_PARAM_KEY } from '../../consts';

export const useFilterModal = (onClose: () => void) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // -----------------------------------------------------------------------
  // Filter
  // -----------------------------------------------------------------------

  const onApply = (value?: number | string | null) => {
    onClose();
    if (value === undefined || value === null) {
      searchParams.delete(AGENCY_CODE_FILTER_PARAM_KEY);
      setSearchParams(searchParams, { replace: true });
      return;
    }
    setSearchParams({ agencyCode: value.toString() }, { replace: true });
  };

  const clearAgencyCodeFilter = useCallback(() => {
    if (searchParams.has(AGENCY_CODE_FILTER_PARAM_KEY)) {
      searchParams.delete(AGENCY_CODE_FILTER_PARAM_KEY);
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return { onApply, clearAgencyCodeFilter };
};
