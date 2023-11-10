import { FileSGProps, Menu, MenuItem } from '@filesg/design-system';
import React from 'react';

import { StyledDropdownContainer, StyledIconButton } from './style';

interface ListButtonMenuItem {
  label: string;
  onClick: () => void;
}

type Props = {
  items: ListButtonMenuItem[];
  buttonSize?: 'SMALL' | 'NORMAL';
  menuInitialAnchorPosition?: 'left' | 'right';
} & FileSGProps;

export const ListButtonMenu = ({ items, buttonSize = 'SMALL', menuInitialAnchorPosition = 'left', ...rest }: Props) => {
  const [isListExpanded, setIsListExpanded] = React.useState(false);
  const iconButtonRef = React.useRef<HTMLButtonElement>(null);

  function listHandler() {
    if (!isListExpanded) {
      setIsListExpanded(true);
    } else {
      setIsListExpanded(false);
    }
  }

  function onClose() {
    setIsListExpanded(false);
  }

  function onMenuItemClick(itemOnClickHandler: () => void) {
    itemOnClickHandler();
    onClose();
  }

  return (
    <StyledDropdownContainer>
      <StyledIconButton
        decoration="GHOST"
        icon="sgds-icon-ellipsis"
        color="DEFAULT"
        size={buttonSize}
        onClick={listHandler}
        ref={iconButtonRef}
        aria-label={rest['aria-label'] ?? undefined}
      />
      {isListExpanded && (
        <Menu
          anchorEl={iconButtonRef.current!}
          anchorPadding={{ vertical: 8 }}
          autoAnchorPosition
          autoAnchorInitial={menuInitialAnchorPosition}
          onClose={onClose}
        >
          {items.map((item, index) => {
            return (
              <MenuItem
                label={item.label}
                value=""
                key={`list-menu-item-${index}`}
                onClick={() => onMenuItemClick(item.onClick)}
              ></MenuItem>
            );
          })}
        </Menu>
      )}
    </StyledDropdownContainer>
  );
};
