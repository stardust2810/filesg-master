import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OptionProps } from '../../../../../libs/frontend/design-system/src';

import { AGENCY_CODE_FILTER_PARAM_KEY } from '../../consts';

export const useActiveFilters = (
  options: Array<OptionProps>,
  setSelectedFilter: (filter?: string | null) => void,
  selectedFilter?: string | null,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    // if options are not fetched, don't do anth
    // if option is empty, searchParam wun be displayed
    if (options.length < 1) {
      return;
    }

    if (searchParams.has(AGENCY_CODE_FILTER_PARAM_KEY)) {
      const selectedAgencyCode = searchParams.get(AGENCY_CODE_FILTER_PARAM_KEY);
      // even if not in the user's list, we will also set it as the selected value, let isFilterInvalid guard the rest
      setSelectedFilter(selectedAgencyCode?.toUpperCase() ?? undefined);
      return;
    }
    setSelectedFilter(null);
  }, [options, searchParams, setSearchParams]);
  const isFilterInvalid = useMemo(() => {
    if (!options.length) {
      return true;
    }
    if (selectedFilter === null) {
      return false;
    }
    return !options.some((option) => (option.value as string).toUpperCase() === selectedFilter);
  }, [options, selectedFilter]);

  return { isFilterInvalid };
};
