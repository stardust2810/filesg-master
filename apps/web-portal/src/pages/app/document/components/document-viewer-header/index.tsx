import { ViewableFileAssetResponse } from '@filesg/common';
import { FSG_DEVICES, IconButton, RESPONSIVE_VARIANT, Skeleton, Typography, useShouldRender } from '@filesg/design-system';
import { ComponentProps } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import EllipsisFileName from '../../../../../components/data-display/ellipsis-file-name';
import { StatusTag } from '../../../../../components/data-display/status-tag';
import { TEST_IDS, WebPage } from '../../../../../consts';
import { BaseDocumentLocationState } from '../document-renderer';
import { StyledBackButtonAndFileNameContainer, StyledFileNameContainer, StyledWrapper } from './style';

// File name ellipsis constants
const MINIMUM_CHAR_COUNT_TO_ELLIPSIS = 12;
const NUMBER_OF_REAR_CHAR = 8;

const HEADER_SKELETON_WIDTH = 480;

interface Props {
  fileAssetInfo?: ViewableFileAssetResponse;
  isLoading?: boolean;
  onBackButtonClick?: () => void;
}

export function DocumentViewerHeader({ fileAssetInfo, isLoading = false, onBackButtonClick }: Props) {
  // ===========================================================================
  // Consts
  // ===========================================================================
  const navigate = useNavigate();
  const location = useLocation();

  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);

  const responsiveTypographyProps = ((): Pick<ComponentProps<typeof Typography>, 'variant' | 'overrideFontFamily'> => {
    switch (true) {
      case isSmallerThanSmallTablet:
        return {
          variant: 'BODY',
        };
      case isSmallerThanNormalTabletLandscape:
        return {
          variant: 'H3',
          overrideFontFamily: 'Work Sans',
        };
      default:
        return {
          variant: 'H2',
        };
    }
  })();

  // ===========================================================================
  // Handlers
  // ===========================================================================
  function handleBackButton() {
    onBackButtonClick?.();

    const prevPath = (location.state as BaseDocumentLocationState)?.prevPath;
    if (prevPath) {
      return navigate(prevPath);
    }

    // If no prevPath (e.g.: From external webpage), nav to myFiles
    return navigate(`${WebPage.FILES}`);
  }

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <StyledWrapper>
      <StyledBackButtonAndFileNameContainer>
        <IconButton
          decoration="GHOST"
          icon="sgds-icon-chevron-left"
          color="DEFAULT"
          size={isSmallerThanSmallTablet ? 'SMALL' : 'NORMAL'}
          onClick={handleBackButton}
          ariaLabel="Back"
        />
        <StyledFileNameContainer>
          {isLoading ? (
            <Skeleton
              variant="TEXT"
              textVariant={responsiveTypographyProps.variant}
              width={HEADER_SKELETON_WIDTH}
              data-testid={TEST_IDS.DOCUMENT_HEADER_SKELETON}
            />
          ) : (
            fileAssetInfo && !fileAssetInfo.isDeleted && (
              <EllipsisFileName
                fontVariant={responsiveTypographyProps.variant}
                overrideFontFamily={responsiveTypographyProps.overrideFontFamily}
                bold="FULL"
                minimumCharCountToEllipsis={MINIMUM_CHAR_COUNT_TO_ELLIPSIS}
                numberOfRearChar={NUMBER_OF_REAR_CHAR}
              >
                {fileAssetInfo.name}
              </EllipsisFileName>
            )
          )}
        </StyledFileNameContainer>
        {!isLoading && fileAssetInfo && !fileAssetInfo.isDeleted && (
          <StatusTag
            status={fileAssetInfo.status}
            isExpired={!!fileAssetInfo.isExpired}
            size={isSmallerThanSmallTablet ? 'DEFAULT' : 'LARGE'}
          />
        )}
      </StyledBackButtonAndFileNameContainer>
    </StyledWrapper>
  );
}
