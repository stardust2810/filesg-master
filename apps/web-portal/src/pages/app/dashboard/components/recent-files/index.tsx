import { SORT_BY, ViewableFileAssetResponse } from '@filesg/common';
import { Color, FSG_DEVICES, RESPONSIVE_VARIANT, TextButton, TextLink, Tooltip, Typography, useShouldRender } from '@filesg/design-system';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { MINIMUM_LOAD_DELAY_IN_MILLISECONDS, WebPage } from '../../../../../consts';
import { useAllFileAssets } from '../../../../../hooks/queries/useAllFileAssets';
import { RecentFile } from './components/recent-file';
import { RecentFileSkeleton } from './components/recent-file-skeleton';
import {
  StyledErrorOrNoFilesContainer,
  StyledFilesContainer,
  StyledNavContainer,
  StyledRecentFilesContainer,
  StyledTitleContainer,
} from './style';

const TEST_IDS = {
  RECENT_FILES: 'recent-files',
  RECENT_FILES_SKELETON: 'recent-files-skeleton',
  RECENT_FILES_HEADER: 'recent-files-header',
  RECENT_FILES_TOOLTIP: 'recent-files-tooltip',
  RECENT_FILE: 'recent-file',
  EMPTY_RECENT_FILES: 'empty-recent-files',
  TO_ALL_FILES_BUTTON: 'to-all-files-btn',
  RECENT_FILES_LEARN_MORE_BUTTON: 'recent-files-learn-more-btn',
};

const ITEMS_PER_FETCH = 5;
const SECTION_TITLE = 'Recent Files';
const TOOLTIP_CONTENT = 'Your recently viewed files';
const TOOLTIP_ARIA_LABEL = 'Your recently viewed files';
const EMPTY_MESSAGE = 'No files yet!';
const EMPTY_MESSAGE_DESCRIPTION = 'Files you recently viewed will be listed here.';
const ERROR_MESSAGE = 'We can’t seem to load your recently viewed files.';

export const RecentFiles = () => {
  const [files, setFiles] = useState<ViewableFileAssetResponse[]>();
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  const {
    isLoading,
    isError,
    data,
    refetch: fetchRecentFiles,
  } = useAllFileAssets({
    sortBy: SORT_BY.LAST_VIEWED_AT,
    asc: false,
    page: 1,
    limit: ITEMS_PER_FETCH,
    ignoreNull: true,
  });

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, MINIMUM_LOAD_DELAY_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchRecentFiles();
  }, [fetchRecentFiles]);

  useEffect(() => {
    if (data) {
      const tempList: ViewableFileAssetResponse[] = [];

      data.pages.forEach((page) => {
        page.items.forEach((file) => {
          tempList.push(file);
        });
      });

      setFiles(tempList);
    }
  }, [data]);

  const renderFiles = () => {
    switch (true) {
      case isLoading || (!isLoading && !show):
        return (
          <StyledFilesContainer data-testid={TEST_IDS.RECENT_FILES_SKELETON}>
            <RecentFileSkeleton />
            <RecentFileSkeleton />
            <RecentFileSkeleton />
          </StyledFilesContainer>
        );
      case isError:
        return (
          <StyledErrorOrNoFilesContainer>
            <Typography variant="BODY">{ERROR_MESSAGE}</Typography>
            <TextButton
              label={'Reload Files'}
              endIcon="sgds-icon-refresh"
              color={Color.PURPLE_DEFAULT}
              onClick={() => fetchRecentFiles()}
            />
          </StyledErrorOrNoFilesContainer>
        );
      case files && files.length === 0:
        return (
          <StyledErrorOrNoFilesContainer data-testid={TEST_IDS.EMPTY_RECENT_FILES}>
            <Typography variant="BODY">{EMPTY_MESSAGE}</Typography>
            <Typography variant="BODY">{EMPTY_MESSAGE_DESCRIPTION}</Typography>
          </StyledErrorOrNoFilesContainer>
        );
      case files && files.length > 0:
        return (
          <StyledFilesContainer>
            {files?.map((file, index) => {
              const { type, name, uuid, lastViewedAt } = file;
              return (
                <RecentFile
                  data-testid={`${TEST_IDS.RECENT_FILE}-${index}`}
                  key={index}
                  linkTo={`..${WebPage.FILES}/${uuid}`}
                  linkState={{
                    prevPath: pathname,
                  }}
                  type={type}
                  name={name}
                  lastViewedAt={new Date(lastViewedAt!)}
                />
              );
            })}

            <StyledNavContainer>
              <TextLink
                endIcon={'sgds-icon-arrow-right'}
                type={'LINK'}
                to={WebPage.FILES}
                data-testid={TEST_IDS.TO_ALL_FILES_BUTTON}
                underline={false}
              >
                View all files
              </TextLink>
            </StyledNavContainer>
          </StyledFilesContainer>
        );
      default:
        return null;
    }
  };
  return (
    <StyledRecentFilesContainer>
      <StyledTitleContainer data-testid={TEST_IDS.RECENT_FILES_HEADER}>
        <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} overrideFontFamily="Work Sans" bold="SEMI" color={Color.GREY80}>
          {SECTION_TITLE}
        </Typography>
        <Tooltip
          aria-label={TOOLTIP_ARIA_LABEL}
          data-testid={TEST_IDS.RECENT_FILES_TOOLTIP}
          iconSize="ICON_SMALL"
          content={TOOLTIP_CONTENT}
          identifier="recent_files"
        />
      </StyledTitleContainer>
      {renderFiles()}
    </StyledRecentFilesContainer>
  );
};
