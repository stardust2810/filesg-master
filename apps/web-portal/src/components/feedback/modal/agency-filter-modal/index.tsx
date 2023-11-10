import { Button, FileSGProps, Modal, Select, TextButton, TextInputLabel } from '@filesg/design-system';
import { useCallback, useState } from 'react';

import { TEST_IDS } from '../../../../consts';
import { StyledFooter, StyledSelectFieldContainer } from './style';

interface Props extends FileSGProps {
  options: Array<any>;
  defaultValue?: number | string | null;
  onClose: () => void;
  // onApply to implement onClose
  onApply: (value?: string | number | null) => void;
}

const MODAL_TITLE = 'Filter';
const CLEAR_FILTER_BUTTON_LABEL = 'Clear Filter';
const APPLY_CHANGES_BUTTON_LABEL = 'Apply';

export const AgencyFilterModal = ({ options, onClose, onApply, defaultValue, ...rest }: Props) => {
  const [selectedValue, setSelectedValue] = useState<string | number | null | undefined>(defaultValue);

  const onChange = useCallback(
    (value?: string | number) => {
      setSelectedValue(value);
    },
    [setSelectedValue],
  );

  const onClearFilter = () => {
    onChange(undefined);
  };

  return (
    <Modal onBackdropClick={onClose} data-testid={rest['data-testid'] ?? TEST_IDS.INFORMATION_MODAL}>
      <Modal.Card>
        <Modal.Header onCloseButtonClick={onClose}>
          <Modal.Title>{MODAL_TITLE}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StyledSelectFieldContainer>
            <TextInputLabel label="Agency" />
            <Select
              defaultValue={selectedValue}
              // Let filter modal handle scroll lock
              hasScrollLockWhenExpanded={false}
              options={options}
              placeholder={'Select Agency'}
              onChange={onChange}
            />
          </StyledSelectFieldContainer>
        </Modal.Body>
        <StyledFooter>
          <TextButton
            disabled={!selectedValue}
            label={CLEAR_FILTER_BUTTON_LABEL}
            onClick={onClearFilter}
            data-testid={TEST_IDS.AGENCY_FILTER_MODAL_CLEAR_FILTER_BUTTON}
          />
          <Button
            label={APPLY_CHANGES_BUTTON_LABEL}
            onClick={() => onApply(selectedValue)}
            data-testid={TEST_IDS.AGENCY_FILTER_MODAL_APPLY_FILTER_BUTTON}
          />
        </StyledFooter>
      </Modal.Card>
    </Modal>
  );
};
