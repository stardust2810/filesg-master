import { toKebabCase } from '@filesg/design-system';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { TEST_IDS } from '../../../consts';
import { StyleProps } from '../../../typings';
import { TabTitle } from './components/tab-title';
import { Container, StyledSelector, TabTitleContainer } from './style';

type Props = {
  children: React.ReactElement | React.ReactElement[];
  tabsName?: string;
  delayCalculation?: boolean;
  onTitleClickHandler?: () => void;
  onTabClick?: (name: string) => void;
} & StyleProps;

export const Tabs = ({ children, style, className, tabsName, onTitleClickHandler, onTabClick, delayCalculation = false }: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const selectorRef = useRef<HTMLDivElement>(null);
  const tabTitleContainerRef = useRef<HTMLDivElement>(null);

  const calculateSelectorWidth = useCallback(() => {
    if (selectorRef.current) {
      selectorRef.current.style.width = `${tabTitleContainerRef.current!.querySelectorAll('button')[selectedTab].clientWidth}px`;
    }
  }, [selectedTab]);

  const calculateSelectorOffsetLeft = useCallback(() => {
    if (selectorRef.current) {
      selectorRef.current.style.left = `${tabTitleContainerRef.current!.querySelectorAll('button')[selectedTab].offsetLeft}px`;
    }
  }, [selectedTab]);

  useEffect(() => {
    if (delayCalculation) {
      setTimeout(() => {
        calculateSelectorWidth();
      }, 300);
    } else {
      calculateSelectorWidth();
    }
  }, [calculateSelectorWidth, delayCalculation]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      calculateSelectorOffsetLeft();
      calculateSelectorWidth();
    });
  });

  const setSelectedTabHandler = (index: number, e) => {
    setSelectedTab(index);

    // use currentTarget as target might point to button children (e.g: span)
    if (selectorRef.current) {
      selectorRef.current.style.left = e.currentTarget.offsetLeft + 'px';
    }
    calculateSelectorWidth();
  };
  const getAriaOwns = () => {
    const tabCount = React.Children.count(children);
    let ariaOwns = '';
    for (let i = 0; i <= tabCount; i++) {
      if (i !== tabCount) {
        ariaOwns = ariaOwns.concat(`tab-title-${i} `);
      }
    }
    return ariaOwns;
  };
  return (
    <Container style={style} className={className} data-testid={`${TEST_IDS.TABS}-${tabsName && toKebabCase(tabsName)}`}>
      <TabTitleContainer
        onClick={onTitleClickHandler}
        ref={tabTitleContainerRef}
        className="fsg-tab-title-container"
        role="tablist"
        aria-owns={getAriaOwns()}
      >
        {React.Children.map(children, (item, index) => (
          <TabTitle
            className={`${className}`}
            data-testid={`${TEST_IDS.TAB_TITLE}-${toKebabCase(item.props.testName)}`}
            key={index}
            title={item.props.title}
            index={index}
            active={selectedTab === index}
            setSelectedTab={setSelectedTabHandler}
            onClick={() => onTabClick?.(item.props.testName)}
          />
        ))}
        <StyledSelector className="fsg-tab-title-selector" ref={selectorRef}></StyledSelector>
      </TabTitleContainer>
      {React.Children.count(children) > 1 ? children[Number(selectedTab)] : children}
    </Container>
  );
};
