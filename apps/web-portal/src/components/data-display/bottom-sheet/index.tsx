import { Color, FSG_DEVICES, Icon, IconLiterals, RESPONSIVE_VARIANT, ResponsiveRenderer, Typography } from '@filesg/design-system';
import { easings, useTransition } from '@react-spring/web';
import React from 'react';

import { TEST_IDS } from '../../../consts';
import { useFocusTrap } from '../../../hooks/common/useFocusTrap';
import { StyledBodyContainer, StyledModalBackground, StyledTab, StyledTabsContainer, StyledWrapper } from './style';

export enum BOTTOM_SHEET_TAB {
  NONE_SELECTED = '',
  FILE_DETAILS = 'File Details',
  MORE_ACTIONS = 'More Actions',
}

export interface TabObject {
  label: BOTTOM_SHEET_TAB;
  icon?: IconLiterals;
  content: React.ReactNode;
}

interface Props {
  tabObjects: TabObject[];
  tabSelected: BOTTOM_SHEET_TAB;
  setTabSelected: React.Dispatch<React.SetStateAction<BOTTOM_SHEET_TAB>>;
}

export function BottomSheet({ tabObjects, tabSelected, setTabSelected }: Props) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  useFocusTrap({ refs: tabSelected !== BOTTOM_SHEET_TAB.NONE_SELECTED ? [bodyRef] : [] });

  const tabContentTransition = useTransition(tabSelected, {
    from: { height: '0' },
    enter: { height: '80vh' },
    leave: (item) => {
      if (item === BOTTOM_SHEET_TAB.NONE_SELECTED) {
        return {};
      }
      return { height: '0' };
    },
    key: (item: BOTTOM_SHEET_TAB) => (item !== BOTTOM_SHEET_TAB.NONE_SELECTED ? 'tab' : ''), // If any tab is selected, common key is given so that additional tab content won't be created
    exitBeforeEnter: true,
    config: {
      duration: 400,
      easing: easings.easeInOutCubic,
    },
  });

  return tabContentTransition((style, item) => (
    <>
      {item && <StyledModalBackground onClick={() => setTabSelected(BOTTOM_SHEET_TAB.NONE_SELECTED)} />}
      <StyledWrapper ref={wrapperRef}>
        <StyledTabsContainer>
          {tabObjects.map((tab) => {
            return (
              <StyledTab
                key={`${TEST_IDS.BOTTOM_SHEET_TAB}-${tab.label}`}
                data-testid={`${TEST_IDS.BOTTOM_SHEET_TAB}-${tab.label}`}
                onClick={() => setTabSelected(tab.label)}
                isExpanded={item !== BOTTOM_SHEET_TAB.NONE_SELECTED}
                isSelected={item === tab.label}
              >
                <ResponsiveRenderer variant={RESPONSIVE_VARIANT.SMALLER_THAN} device={FSG_DEVICES.SMALL_TABLET}>
                  <>
                    {tab.icon && <Icon icon={tab.icon} size="ICON_SMALL" color={Color.GREY30} />}
                    <Typography variant="SMALL" bold="FULL" color={Color.GREY70}>
                      {tab.label}
                    </Typography>
                  </>
                </ResponsiveRenderer>
                <ResponsiveRenderer variant={RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO} device={FSG_DEVICES.SMALL_TABLET}>
                  <>
                    {tab.icon && <Icon icon={tab.icon} size="ICON_NORMAL" color={Color.GREY30} />}
                    <Typography variant="PARAGRAPH" bold="FULL" color={Color.GREY70}>
                      {tab.label}
                    </Typography>
                  </>
                </ResponsiveRenderer>
              </StyledTab>
            );
          })}
        </StyledTabsContainer>
        {item !== BOTTOM_SHEET_TAB.NONE_SELECTED && (
          <StyledBodyContainer ref={bodyRef} style={style}>
            {tabObjects.map((tab) => item === tab.label && tab.content)}
          </StyledBodyContainer>
        )}
      </StyledWrapper>
    </>
  ));
}
