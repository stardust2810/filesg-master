import React, { useCallback, useEffect, useRef, useState } from 'react';

import { IconFileTypeLiterals, IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { ButtonColorsTheme } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { Modal } from '../../feedback/modal';
import { MenuItem, OptionProps } from './components/menu-item';
import {
  StyledButton,
  StyledContainer,
  StyledIcon,
  StyledIconTextContainer,
  StyledIconWrapper,
  StyledItemsContainer,
  StyledText,
} from './style';

export type Props = {
  options: Array<OptionProps>;
  placeholder?: string;
  color?: ButtonColorsTheme;
  icon?: IconLiterals | IconFileTypeLiterals;
  onChange: (value?: string | number) => void;
  defaultValue?: string | number | null;
  fluid?: boolean;
  alignment?: 'LEFT' | 'RIGHT' | 'CENTER';
  size?: 'NORMAL' | 'SMALL';
  onSelectAnimateMenuSlideUp?: boolean;
  hasScrollLockWhenExpanded?: boolean;
} & FileSGProps;

export function Select({
  color = 'PRIMARY',
  icon,
  onChange,
  placeholder,
  defaultValue,
  fluid = false,
  alignment = 'LEFT',
  className,
  size = 'NORMAL',
  onSelectAnimateMenuSlideUp = true,
  options,
  hasScrollLockWhenExpanded = true,
  ...rest
}: Props): JSX.Element {
  const [selected, setSelected] = useState<OptionProps | undefined>(
    defaultValue ? options.find((element) => element.value === defaultValue) : undefined,
  );
  const [focusedListIndex, _setFocusedIndex] = useState<number>(0);

  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  // SelectRef is used to focus back on select when a choice is made
  const selectRef = useRef<HTMLButtonElement>(null);
  const selectEl = useRef<HTMLDivElement>(null);
  const selectMenuEl = useRef<HTMLUListElement>(null);
  const listItemRefs = useRef<HTMLLIElement[]>([]);

  /**
   * Have to use refs to allow the state values to be accessible
   * by the event listener callback functions
   * Reference:
   * https://stackoverflow.com/questions/55265255/react-usestate-hook-event-handler-using-initial-state
   */
  const focusedListIndexStateRef = useRef<number>(focusedListIndex);
  const setFocusedIndex = useCallback(
    (data: number) => {
      focusedListIndexStateRef.current = data;
      _setFocusedIndex(data);
    },
    [_setFocusedIndex],
  );

  const selectMenuHandler = useCallback(
    (event) => {
      event.stopPropagation();
      if (!isMenuExpanded) {
        setIsMenuExpanded(true);
        // set focus index to selected field
        const selectedIndex = options.findIndex((element) => {
          return element.value.toString() === selected?.value.toString();
        });
        if (selectedIndex > -1) {
          setTimeout(() => listItemRefs?.current[selectedIndex]?.focus(), 100);
          setFocusedIndex(selectedIndex);
        } else {
          setTimeout(() => listItemRefs?.current[0]?.focus(), 100);
          setFocusedIndex(0);
        }
      } else {
        animateMenuSlideUpHandler();
      }

      if (selectRef) {
        selectRef.current?.focus();
      }
    },
    [isMenuExpanded, options, selected?.value, setFocusedIndex],
  );

  useEffect(() => {
    // do nth if default value is not undefined
    if (defaultValue === undefined) {
      setSelected(undefined);
    }
  }, [defaultValue]);

  // Use callback instead of useEffect to ensure that changes only occur when button is clicked
  const onChangeHandler = useCallback(
    (option) => {
      setSelected(option);
      if (!option) {
        onChange(undefined);
        return;
      }
      if (option) {
        onChange(option.value);
      }
    },
    [onChange],
  );

  const onClickHandler = useCallback(
    (event, option) => {
      event.stopPropagation();
      onChangeHandler(option);
      onSelectAnimateMenuSlideUp && selectMenuHandler(event);
    },
    [onSelectAnimateMenuSlideUp, selectMenuHandler, onChangeHandler],
  );

  function animateMenuSlideUpHandler() {
    setTimeout(() => {
      if (selectMenuEl.current) {
        setIsMenuExpanded(false);
      }
    }, 201);

    if (selectMenuEl.current) {
      selectMenuEl.current.className += ' slideUp';
    }
  }

  const onOptionsClose = useCallback((event) => {
    // ensure only menu is closed
    event.preventDefault();
    event.stopPropagation();
    animateMenuSlideUpHandler();
  }, []);

  const keyPressHandler = useCallback(
    (event) => {
      if (!isMenuExpanded) {
        return;
      }
      const { keyCode } = event;
      switch (keyCode) {
        //Tab
        //Esc
        case 9:
        case 27:
          event.preventDefault();
          event.stopPropagation();
          onOptionsClose(event);
          break;

        //Arrow down
        case 40:
          if (focusedListIndexStateRef.current < listItemRefs.current.length - 1) {
            const upcomingIndex = focusedListIndexStateRef.current + 1;
            listItemRefs.current[upcomingIndex].focus();
            setFocusedIndex(upcomingIndex);
            break;
          }
          break;

        //Arrow up
        case 38:
          if (focusedListIndexStateRef.current > 0) {
            const upcomingIndex = focusedListIndexStateRef.current - 1;
            listItemRefs.current[upcomingIndex].focus();
            setFocusedIndex(upcomingIndex);
            break;
          }
          break;

        default:
          break;
      }
    },
    [isMenuExpanded, onOptionsClose, setFocusedIndex],
  );

  return (
    <StyledContainer
      onKeyDown={keyPressHandler}
      ref={selectEl}
      fluid={fluid}
      className={className}
      data-testid={rest['data-testid'] ?? TEST_IDS.SELECT}
    >
      <StyledButton
        aria-haspopup="listbox"
        aria-expanded={isMenuExpanded}
        ref={selectRef}
        color={color}
        onClick={selectMenuHandler}
        expanded={isMenuExpanded}
        size={size}
      >
        <StyledIconTextContainer>
          {icon && <StyledIcon icon={icon} />}
          <StyledText variant={`BUTTON_${size}`} isEllipsis ellipsisLine={1} selectedOption={selected?.label}>
            {selected ? selected.label : placeholder}
          </StyledText>
        </StyledIconTextContainer>
        <StyledIconWrapper $rotate={isMenuExpanded}>
          <Icon icon="sgds-icon-chevron-down" size={`ICON_${size}`} />
        </StyledIconWrapper>
      </StyledButton>
      {isMenuExpanded && (
        <Modal
          pauseFocus={true}
          initialFocus={false}
          allowScrollLock={hasScrollLockWhenExpanded}
          trapFocus={true}
          invisibleBackdrop={true}
          onBackdropClick={animateMenuSlideUpHandler}
          anchorEl={selectRef.current!}
          useAnchorWidth={true}
          anchorPadding={{ vertical: 8 }}
          autoAnchorPosition={true}
          autoAnchorInitial={'left'}
        >
          <StyledItemsContainer role="menu" alignment={alignment} fluid={fluid} ref={selectMenuEl}>
            {options.map((props, index) => (
              <MenuItem
                color="PRIMARY"
                ref={(element) => (listItemRefs.current[index] = element!)}
                selectedValue={selected?.value}
                onClick={(e) => onClickHandler(e, props)}
                key={index}
                {...props}
              />
            ))}
          </StyledItemsContainer>
        </Modal>
      )}
    </StyledContainer>
  );
}
