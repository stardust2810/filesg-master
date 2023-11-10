import 'react-virtualized/styles.css';

import { ActiveActivityResponse, SORT_BY } from '@filesg/common';
import {
  Button,
  Color,
  ErrorInfo,
  FSG_DEVICES,
  OptionProps,
  RESPONSIVE_VARIANT,
  ResponsiveRenderer,
  Tag,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { LegacyRef, useCallback, useEffect, useState } from 'react';
import { AutoSizer, CellMeasurer, CellMeasurerCache, InfiniteLoader, List, WindowScroller } from 'react-virtualized';

import { ActivityCard } from '../../../components/data-display/activities/activity-card';
import { ActivitySkeleton } from '../../../components/data-display/activities/activity-card-skeleton';
import { ListUtilsBar } from '../../../components/data-display/list-utils-bar';
import { NoFilteredResults } from '../../../components/data-display/no-filtered-results';
import { RightSideBar } from '../../../components/data-display/right-side-bar';
import { AgencyFilterModal } from '../../../components/feedback/modal/agency-filter-modal';
import { Breadcrumb } from '../../../components/navigation/breadcrumb';
import { Tab } from '../../../components/navigation/tabs/components/tab';
import { MINIMUM_LOAD_DELAY_IN_MILLISECONDS, WebPage } from '../../../consts';
import { INFO_NOT_LOADED_ERROR } from '../../../consts/error';
import { useActiveFilters } from '../../../hooks/common/useActiveFilters';
import { useFilterModal } from '../../../hooks/common/useFilterModal';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAllActivities } from '../../../hooks/queries/useAllActivities';
import { useUserAgencies } from '../../../hooks/queries/useUserAgencies';
import { ActivitiesSortOptions } from '../../../typings';
import { EmptyListInfo } from '../files/components/empty-list-info';
import { ActivitiesSkeleton } from './components/activities-skeleton';
import {
  StyledAllActivitiesContainer,
  StyledBold,
  StyledContainer,
  StyledInfoContainer,
  StyledPageDescriptorContainer,
  StyledTabs,
  StyledTagsContainer,
  StyledTagTypography,
  StyledWrapper,
} from './style';

const TEST_IDS = {
  PAGE_DESCRIPTORS: 'activities-page-descriptors',
  ACTIVITIES: 'activities',
  ACTIVITIES_EMPTY_STATE: 'activities-empty-state',
  ACTIVITIES_NO_FILTERED_RESULTS: 'activities-no-filtered-results',
  ACTIVITY: 'activity',
};

const PAGE_TITLE = 'All Activities';
const PAGE_DESCRIPTION = 'Here are your file transactions with government agencies.';

const ITEMS_PER_FETCH = 10; // should be 10
// FETCH_OFFSET: count of items (buffer) before next page of items should be fetched
const FETCH_OFFSET = 1; // should be 6

// As of MVP, sort options are not modifiable via frontend
const SortOptionDefault: ActivitiesSortOptions = {
  sortBy: SORT_BY.CREATED_AT,
  asc: false,
};

const { image, title, descriptions } = INFO_NOT_LOADED_ERROR('activity page');

const Activities = () => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const [activities, setActivities] = useState<ActiveActivityResponse[]>([]);
  const [show, setShow] = useState(false);
  const [showNextPage, setShowNextPage] = useState<boolean>();

  const [showAgencyFilterModal, setShowAgencyFilterModal] = useState(false);
  const [options, setOptions] = useState<Array<OptionProps>>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>();
  const [toolbarHeight, setToolbarHeight] = useState<number>(0);

  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle('All Activities');

  // ===========================================================================
  // Hooks
  // ===========================================================================

  const onClose = () => {
    setShowAgencyFilterModal(false);
  };

  const { clearAgencyCodeFilter, onApply } = useFilterModal(onClose);
  const { isFilterInvalid } = useActiveFilters(options, setSelectedValue, selectedValue);

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  const { data: userAgencies, isLoading: isLoadingUserAgencies } = useUserAgencies();

  const infiniteQueryResult = useAllActivities(
    {
      sortBy: SortOptionDefault.sortBy,
      asc: SortOptionDefault.asc,
      page: 1,
      limit: ITEMS_PER_FETCH,
      agencyCode: selectedValue as string | null,
    },
    options?.length > 0 && !isFilterInvalid,
  );

  const { isFetching, fetchNextPage, hasNextPage, isLoading, isError, data, refetch: fetchAllActivities } = infiniteQueryResult;

  const isLoadingMore = isFetching || (!isFetching && !showNextPage);
  const isPageLoading = isLoading || (!isLoading && !show) || isLoadingUserAgencies;

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Scroll to top when selectedValue is updated
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedValue]);

  // to show skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, MINIMUM_LOAD_DELAY_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNextPage(true);
    }, MINIMUM_LOAD_DELAY_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, [showNextPage]);

  useEffect(() => {
    if (!options.length) {
      return;
    }
    if (isFilterInvalid) {
      return;
    }
    fetchAllActivities();
  }, [fetchAllActivities, options.length, isFilterInvalid]);

  useEffect(() => {
    if (data && !isLoadingMore && !isPageLoading) {
      const tempList: ActiveActivityResponse[] = [];

      data.pages.forEach((page) => {
        page.items.forEach((activity) => {
          tempList.push(activity);
        });
      });

      setActivities(tempList);
    }
  }, [data, isLoadingMore, isPageLoading]);

  useEffect(() => {
    if (userAgencies?.agencies) {
      const agencyOptions = Object.entries(userAgencies.agencies).reduce<{ label: string; value: string }[]>((prev, [_, obj]) => {
        return [...prev, { label: `${obj.agencyCode} (${obj.agencyName})`, value: obj.agencyCode }];
      }, []);

      agencyOptions.sort(function (a, b) {
        const textA = a.label.toUpperCase();
        const textB = b.label.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      setOptions(agencyOptions);
    }
  }, [userAgencies]);

  // ---------------------------------------------------------------------------
  // Callback ref for UI rendering
  // ---------------------------------------------------------------------------

  const handleRef = useCallback(
    (node) => {
      if (node && node.getBoundingClientRect) {
        const { height } = node.getBoundingClientRect();
        setToolbarHeight(height);
      }
    },
    // added isSmallerThanSmallTablet as dep to update sticky bar top when window is resized
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSmallerThanSmallTablet],
  );

  // ---------------------------------------------------------------------------
  // List rendering
  // ---------------------------------------------------------------------------

  // [REACT_VIRTUALISED]: Take default height as 148px: Desktop view without long filename
  const cache = new CellMeasurerCache({
    defaultHeight: 148,
    fixedWidth: true,
  });

  // Add onResize handler to handle clear CellMeasurerCache due to change in height caused by different viewport width
  const onResize = () => {
    cache.clearAll();
  };

  function renderRow({ index, key, parent, style }) {
    const content = activities![index];
    return (
      <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        {({ measure, registerChild }) => (
          // [REACT_VIRTUALISED]: 'style' attribute required to position cell (within parent List)
          <div onLoad={measure} ref={registerChild as LegacyRef<HTMLDivElement>} style={style}>
            <ActivityCard measure={measure} key={index} activity={content} data-testid={`${TEST_IDS.ACTIVITY}-${index}`} />
          </div>
        )}
      </CellMeasurer>
    );
  }

  // [REACT_VIRTUALISED]: Triggered when isRowLoaded returns false
  const loadMoreRows = () => {
    if (isFetching) {
      return Promise.resolve();
    }
    setShowNextPage(false);
    return fetchNextPage();
  };

  // isRowLoaded will only return false the item loaded has reached the offSet and there are still pages to be loaded
  const isRowLoaded = ({ index }) => {
    // [REACT_VIRTUALISED]: Return false to indicate the items are not loaded and will trigger loadMoreRows to fetchNextPage
    const fetchOffset = FETCH_OFFSET;
    return !(activities!.length - index === fetchOffset) || !hasNextPage;
  };

  function renderList() {
    return (
      <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={activities!.length} threshold={0}>
        {({ onRowsRendered, registerChild }) => (
          <WindowScroller>
            {({ height, scrollTop }) => (
              // [REACT_VIRTUALISED]: Use Autosizer to fill the width but not handle the height (disableHeight to indicate that height need not be handled by Autosizer)
              <AutoSizer onResize={onResize} disableHeight>
                {({ width }) => (
                  <List
                    tabIndex={-1}
                    ref={registerChild}
                    width={width}
                    height={height}
                    autoHeight
                    rowCount={activities!.length}
                    deferredMeasurementCache={cache}
                    rowHeight={cache.rowHeight}
                    onRowsRendered={onRowsRendered}
                    rowRenderer={renderRow}
                    scrollTop={scrollTop}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>
    );
  }

  function renderActivities() {
    switch (true) {
      case activities && activities.length > 0:
        return (
          <StyledTabs topInPx={toolbarHeight} delayCalculation tabsName="activities">
            <Tab testName="all" title="All">
              {renderList()}
              {isLoadingMore && (
                <>
                  <ActivitySkeleton />
                  <ActivitySkeleton />
                  <ActivitySkeleton />
                  <ActivitySkeleton />
                </>
              )}
            </Tab>
          </StyledTabs>
        );

      case options.length > 0 && isFilterInvalid:
        return (
          <StyledContainer data-testid={TEST_IDS.ACTIVITIES_NO_FILTERED_RESULTS}>
            <NoFilteredResults to={WebPage.ACTIVITIES} key="no-filtered-results" />
          </StyledContainer>
        );

      case activities && activities.length === 0:
        return (
          <StyledInfoContainer data-testid={TEST_IDS.ACTIVITIES_EMPTY_STATE}>
            <EmptyListInfo key="empty-results" title="No activities yet!" />
          </StyledInfoContainer>
        );
      default:
        return null;
    }
  }

  return (
    <StyledWrapper>
      {
        <StyledAllActivitiesContainer>
          {isError ? (
            <ErrorInfo title={title} image={image} descriptions={descriptions} />
          ) : isPageLoading ? (
            <ActivitiesSkeleton />
          ) : (
            <>
              <StyledPageDescriptorContainer hasItems={!!activities && activities.length > 0} data-testid={TEST_IDS.PAGE_DESCRIPTORS}>
                <Breadcrumb items={[{ label: PAGE_TITLE, to: WebPage.ACTIVITIES }]} enableNav={false} />
                <Typography variant={'BODY'}>{PAGE_DESCRIPTION}</Typography>
              </StyledPageDescriptorContainer>
              {/* Filters and Search Container, zIndex is set to match pageDescContainer */}
              {options.length > 0 && (
                <ListUtilsBar isSticky={!isFilterInvalid} ref={handleRef}>
                  <Button
                    onClick={() => setShowAgencyFilterModal(true)}
                    size="SMALL"
                    decoration="OUTLINE"
                    color="DEFAULT"
                    startIcon="sgds-icon-filter"
                    label="Filter"
                  />
                  {selectedValue && (
                    <StyledTagsContainer>
                      <Tag isEllipsis={true} onRemoveTag={clearAgencyCodeFilter} removeButtonAriaLabel={'Remove filter'} size="MEDIUM">
                        <StyledTagTypography variant="SMALL" color={Color.GREY60}>
                          Agency - <StyledBold type={'FULL'}>{selectedValue}</StyledBold>
                        </StyledTagTypography>
                      </Tag>
                    </StyledTagsContainer>
                  )}
                </ListUtilsBar>
              )}
              {renderActivities()}
              {showAgencyFilterModal && (
                <AgencyFilterModal defaultValue={selectedValue} onApply={onApply} options={options} onClose={onClose} />
              )}
            </>
          )}
        </StyledAllActivitiesContainer>
      }

      <ResponsiveRenderer variant={RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO} device={FSG_DEVICES.SMALL_DESKTOP}>
        <RightSideBar />
      </ResponsiveRenderer>
    </StyledWrapper>
  );
};

export default Activities;
