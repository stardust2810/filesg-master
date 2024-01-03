import { FILE_ASSET_SORT_BY, FILE_STATUS, FILE_TYPE } from '@filesg/common';
import {
  DATE_FORMAT_PATTERNS,
  ErrorInfo,
  FSG_DEVICES,
  OptionProps,
  RESPONSIVE_VARIANT,
  ResponsiveRenderer,
  sendToastMessage,
  TableRowId,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { ListUtilsBar } from '../../../components/data-display/list-utils-bar';
import { NoFilteredResults } from '../../../components/data-display/no-filtered-results';
import { RightSideBar } from '../../../components/data-display/right-side-bar';
import { ItemDetailsSkeleton } from '../../../components/feedback/skeleton-loader/item-details-skeleton';
import { Breadcrumb } from '../../../components/navigation/breadcrumb';
import { MINIMUM_LOAD_DELAY_IN_MILLISECONDS, QueryKey, WebPage } from '../../../consts';
import { INFO_NOT_LOADED_ERROR } from '../../../consts/error';
import { useActiveFilters } from '../../../hooks/common/useActiveFilters';
import { DownloadAndSaveFileAssetDetails, useDownloadAndSave } from '../../../hooks/common/useDownloadAndSave';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAllFileAssets } from '../../../hooks/queries/useAllFileAssets';
import { useAllFileAssetUuids } from '../../../hooks/queries/useAllFileAssetUuids';
import { useUserAgencies } from '../../../hooks/queries/useUserAgencies';
import { FileAssetSortOptions } from '../../../typings';
import { formatDate } from '../../../utils/common';
import { FilesPageLocationState } from '../document/components/document-renderer';
import { EmptyListInfo } from './components/empty-list-info';
import { FileDetails } from './components/file-details';
import { FileTable } from './components/file-table';
import { FileTableSkeleton } from './components/file-table-skeleton';
import { FilesSkeleton } from './components/files-skeleton';
import { TableUtilsBar } from './components/table-utils-bar';
import {
  StyledBodyContainer,
  StyledInfoContainer,
  StyledPageDescriptorContainer,
  StyledTableContainer,
  StyledTableDisplayContainer,
  StyledTitleContainer,
  StyledWrapper,
} from './style';

export interface FileTableData {
  id: string;
  name: string;
  agencyCode: string | undefined;
  agencyName: string | undefined;
  documentType: FILE_TYPE;
  status: FILE_STATUS;
  createdAt: string;
  expireAt: string;
  deleteAt: string;
  ownerName: string;
  size: number;
  isExpired: boolean;
  showToAcknowledge: boolean;
  isPasswordEncrypted: boolean;
  externalRefId: string | null;
}

const TEST_IDS = {
  TITLE: 'title',
  SUB_TITLE: 'sub-title',
  UTILS_BAR_SECTION: 'utils-bar-section',
};
const ITEMS_PER_FETCH = 10;
const ROWS_WHEN_LOADING = 8;

const SortOptionDefault: FileAssetSortOptions = {
  sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
  asc: false,
};

const { image, title, descriptions } = INFO_NOT_LOADED_ERROR('files');

function Files() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const isViewFile = location.search.includes('?file=');

  const [fileTableRows, setFileTableRows] = useState<FileTableData[]>([]);
  const [selected, setSelected] = useState<TableRowId[]>([]);
  const [filesTotalCount, setFilesTotalCount] = useState(-1);
  const [sortOption, setSortOption] = useState<FileAssetSortOptions>(SortOptionDefault);
  const [show, setShow] = useState(false);
  const [showNextPage, setShowNextPage] = useState(false);
  const [options, setOptions] = useState<Array<OptionProps>>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>();
  const [toolbarHeight, setToolbarHeight] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Page title
  // ---------------------------------------------------------------------------
  usePageTitle('My Files');

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const { isFilterInvalid } = useActiveFilters(options, setSelectedValue, selectedValue);

  function handleViewFile(fileAssetUuid: string) {
    const state: FilesPageLocationState = { fileAssetUuids: [], prevPath: location.pathname + location.search };
    if (fileAssetUuidsData) {
      state.fileAssetUuids = fileAssetUuidsData.fileAssets;
    }
    navigate(`..${WebPage.FILES}/${fileAssetUuid}`, { state });
  }

  const handleSort = (sortType: FILE_ASSET_SORT_BY) => {
    const { sortBy, asc } = sortOption;

    setSortOption({
      sortBy: sortType,
      asc: !asc,
    });
    queryClient.resetQueries([QueryKey.AGENCY_REDIRECT, QueryKey.FILES, sortBy, asc, ITEMS_PER_FETCH], { exact: true });
  };

  const { handleDownloadAndSave } = useDownloadAndSave();

  function handleSelectionDownload(fileAssets: FileTableData[]) {
    const downloadableFileAssets = fileAssets.filter((fileAsset) => {
      const { showToAcknowledge: requiresAcknowledgement } = fileAsset;

      return !requiresAcknowledgement;
    });

    if (fileAssets.length !== downloadableFileAssets.length) {
      return sendToastMessage(
        {
          title: 'Unable to download selected file(s).',
          description: 'One or more files cannot be downloaded due to a pending action. Resolve the action to proceed.',
        },
        'error',
        {
          autoClose: false,
        },
      );
    }

    const downloadFileAssetDetailsList: DownloadAndSaveFileAssetDetails[] = downloadableFileAssets.map((fileAsset) => {
      const { id, name, size } = fileAsset;
      return {
        fileAssetUuid: id,
        fileName: name,
        fileSize: size,
      };
    });

    handleDownloadAndSave(downloadFileAssetDetailsList);
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  const infiniteQueryResult = useAllFileAssets(
    sortOption
      ? {
          sortBy: sortOption.sortBy,
          asc: sortOption.asc,
          page: 1,
          limit: ITEMS_PER_FETCH,
          agencyCodes: selectedValue ? [selectedValue] : null,
        }
      : undefined,
    options?.length > 0 && !isFilterInvalid,
  );

  const {
    isLoading: isLoadingFiles,
    isFetching: isFetchingFiles,
    error: filesError,
    data: fileAssetData,
    refetch: fetchAllAgencyFiles,
    isFetchingNextPage,
  } = infiniteQueryResult;

  const { data: fileAssetUuidsData } = useAllFileAssetUuids(
    sortOption
      ? {
          sortBy: sortOption.sortBy,
          asc: sortOption.asc,
          agencyCodes: selectedValue ? [selectedValue] : null,
        }
      : undefined,
    options?.length > 0 && !isFilterInvalid,
  );

  const { data: userAgencies, isLoading: isLoadingUserAgencies } = useUserAgencies();

  const isPageLoading = isLoadingFiles || (!isLoadingFiles && !show);
  const isLoadingMore = isFetchingFiles || (!isFetchingFiles && !showNextPage) || isLoadingUserAgencies;

  // ---------------------------------------------------------------------------
  // Effect hooks
  // ---------------------------------------------------------------------------

  // Scroll to top when selectedValue is updated
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedValue]);

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
    if (isFetchingNextPage) {
      setShowNextPage(false);
    }
  }, [isFetchingNextPage]);

  useEffect(() => {
    if (!options.length) {
      return;
    }
    if (isFilterInvalid) {
      return;
    }
    if (!isViewFile) {
      fetchAllAgencyFiles();
    }
  }, [fetchAllAgencyFiles, isFilterInvalid, isViewFile, options.length, sortOption]);

  useEffect(() => {
    if (fileAssetData && !isLoadingMore && !isPageLoading) {
      const tempList: FileTableData[] = [];

      fileAssetData.pages.forEach((page) => {
        page.items.forEach((item) => {
          const {
            uuid,
            name,
            type,
            size,
            createdAt,
            expireAt,
            ownerName,
            agencyCode,
            agencyName,
            status,
            isExpired,
            isAcknowledgementRequired,
            acknowledgedAt,
            deleteAt,
            isPasswordEncrypted,
            externalRefId,
          } = item;

          const showToAcknowledge = isAcknowledgementRequired && !acknowledgedAt;

          tempList.push({
            id: uuid,
            name,
            agencyCode,
            agencyName,
            documentType: type,
            status,
            createdAt: formatDate(`${createdAt}`, DATE_FORMAT_PATTERNS.DATE_TIME),
            expireAt: expireAt ? formatDate(`${expireAt}`, DATE_FORMAT_PATTERNS.DATE) : '',
            deleteAt: deleteAt ? formatDate(`${deleteAt}`, DATE_FORMAT_PATTERNS.DATE) : '',
            ownerName: ownerName ?? '-',
            size,
            isExpired,
            showToAcknowledge,
            isPasswordEncrypted,
            externalRefId,
          });
        });

        if (filesTotalCount === -1 || filesTotalCount !== page.count) {
          setFilesTotalCount(page.count);
        }
      });

      setFileTableRows(tempList);
    }
  }, [fileAssetData, filesTotalCount, isLoadingMore, isPageLoading]);

  // ---------------------------------------------------------------------------
  // Filter Callback
  // ---------------------------------------------------------------------------
  const handleRef = useCallback(
    (node) => {
      if (node && node.getBoundingClientRect) {
        const { height } = node.getBoundingClientRect();
        setToolbarHeight(height);
      }
    },
    // added isSmallerThanSmallTablet as dep to update sticky bar top when window is resized
    // added select to allow update when any files are checked
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSmallerThanSmallTablet, selected],
  );

  // ---------------------------------------------------------------------------
  // Document logics
  // ---------------------------------------------------------------------------
  const selectedFiles = fileTableRows?.filter((fileTableData) => selected.includes(fileTableData.id));

  const content = () => {
    switch (true) {
      case options.length === 0:
        return (
          <StyledInfoContainer>
            <EmptyListInfo />
          </StyledInfoContainer>
        );
      case filesTotalCount < 1:
        return <NoFilteredResults to={WebPage.FILES} />;
      default:
        return (
          <>
            <FileTable
              topInPx={toolbarHeight}
              rows={fileTableRows}
              onItemsSelect={(ids) => setSelected(ids)}
              onDownloadClick={(id, name, size) => handleDownloadAndSave([{ fileAssetUuid: id, fileName: name, fileSize: size }])}
              onViewClick={(id) => handleViewFile(id)}
              onSortClick={handleSort}
              asc={sortOption.asc}
              infiniteQueryResult={infiniteQueryResult}
            />
            {isLoadingMore && <FileTableSkeleton hideHeader={true} numberOfRows={ROWS_WHEN_LOADING} />}
          </>
        );
    }
  };

  // -----------------------------------------------------------------------
  // Conditional Rendering
  // -----------------------------------------------------------------------

  if (isViewFile) {
    return <Outlet />;
  }
  return (
    <StyledWrapper>
      <StyledBodyContainer>
        {filesError ? (
          <ErrorInfo image={image} title={title} descriptions={descriptions} />
        ) : isPageLoading ? (
          <FilesSkeleton />
        ) : (
          <>
            <StyledPageDescriptorContainer hasItems={filesTotalCount > 0}>
              <StyledTitleContainer>
                <Breadcrumb
                  items={[
                    { label: 'My Files', to: '/unknown' },
                    { label: 'Issued to you', to: WebPage.FILES },
                  ]}
                  enableNav={false}
                />
              </StyledTitleContainer>
              <Typography variant="BODY" data-testid={TEST_IDS.SUB_TITLE}>
                Here are the files issued to you by government agencies.
              </Typography>
            </StyledPageDescriptorContainer>
            <StyledTableContainer>
              {options.length > 0 && (
                <ListUtilsBar isSticky={!isFilterInvalid} ref={handleRef} data-testid={TEST_IDS.UTILS_BAR_SECTION}>
                  <TableUtilsBar
                    selectedFilterValue={selectedValue}
                    options={options}
                    selectedFiles={selected}
                    onDownloadClick={() => handleSelectionDownload(selectedFiles)}
                  />
                </ListUtilsBar>
              )}
              <StyledTableDisplayContainer rows={fileTableRows.length}>{content()}</StyledTableDisplayContainer>
            </StyledTableContainer>
          </>
        )}
      </StyledBodyContainer>
      <ResponsiveRenderer variant={RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO} device={FSG_DEVICES.SMALL_DESKTOP}>
        <RightSideBar>
          {isPageLoading ? (
            <ItemDetailsSkeleton />
          ) : !filesError ? (
            <FileDetails
              title="Issued to you"
              selectedFiles={selectedFiles}
              activeFilter={selectedValue}
              filesTotalCount={filesTotalCount}
            />
          ) : null}
        </RightSideBar>
      </ResponsiveRenderer>
    </StyledWrapper>
  );
}

export default Files;
