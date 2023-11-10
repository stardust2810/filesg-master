import {
  Button,
  Color,
  Divider,
  FSG_DEVICES,
  OptionProps,
  RESPONSIVE_VARIANT,
  TableRowId,
  Tag,
  useShouldRender,
} from '@filesg/design-system';
import { useState } from 'react';

import { AgencyFilterModal } from '../../../../../components/feedback/modal/agency-filter-modal';
import { useFilterModal } from '../../../../../hooks/common/useFilterModal';
import { StyledBold, StyledFilterTagsContainer, StyledTableUtilsBar, StyledTableUtilsRow, StyledTagTypography } from './style';

const TEST_IDS = {
  TABLE_SELECTED_OPTIONS_CONTAINER: 'table-selected-options-container',
  DOWNLOAD_BUTTON: 'download-button',
};

type Props = {
  selectedFiles: TableRowId[];
  onDownloadClick: () => void;
  options: Array<OptionProps>;
  selectedFilterValue?: string | null;
};

export function TableUtilsBar({ selectedFiles, onDownloadClick, options, selectedFilterValue }: Props) {
  const [showAgencyFilterModal, setShowAgencyFilterModal] = useState(false);
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  // -----------------------------------------------------------------------
  // Filter
  // -----------------------------------------------------------------------

  const onClose = () => {
    setShowAgencyFilterModal(false);
  };

  const { clearAgencyCodeFilter, onApply } = useFilterModal(onClose);

  return (
    <StyledTableUtilsBar>
      {selectedFiles.length > 0 && (
        <StyledTableUtilsRow data-testid={TEST_IDS.TABLE_SELECTED_OPTIONS_CONTAINER}>
          <Button
            decoration="SOLID"
            color="DEFAULT"
            label="Download"
            endIcon="sgds-icon-download"
            onClick={onDownloadClick}
            size="SMALL"
            data-testid={TEST_IDS.DOWNLOAD_BUTTON}
            aria-label="Download selected files"
          />
          {!isSmallerThanSmallTablet && <Divider isVertical={true} />}
        </StyledTableUtilsRow>
      )}
      <StyledTableUtilsRow>
        <Button
          onClick={() => setShowAgencyFilterModal(true)}
          size="SMALL"
          decoration="OUTLINE"
          color="DEFAULT"
          startIcon="sgds-icon-filter"
          label="Filter"
        />
        {selectedFilterValue && (
          <StyledFilterTagsContainer>
            <Tag isEllipsis={true} onRemoveTag={clearAgencyCodeFilter} removeButtonAriaLabel={'Remove filter'} size="MEDIUM">
              <StyledTagTypography variant="SMALL" color={Color.GREY60}>
                Agency - <StyledBold type={'FULL'}>{selectedFilterValue}</StyledBold>
              </StyledTagTypography>
            </Tag>
          </StyledFilterTagsContainer>
        )}
      </StyledTableUtilsRow>

      {showAgencyFilterModal && (
        <AgencyFilterModal defaultValue={selectedFilterValue} onApply={onApply} options={options} onClose={onClose} />
      )}
    </StyledTableUtilsBar>
  );
}
