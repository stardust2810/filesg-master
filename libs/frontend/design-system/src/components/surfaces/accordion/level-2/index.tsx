import React, { HTMLAttributes, isValidElement, PropsWithChildren, useContext, useEffect } from 'react';

import { useAccordionAnimation } from '../../../../hooks/useAccordionAnimation';
import { useShouldRender } from '../../../../hooks/useShouldRender';
import { Color } from '../../../../styles/color';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../../utils/constants';
import { FileSGProps } from '../../../../utils/typings';
import { Icon } from '../../../data-display/icon';
import { Typography } from '../../../data-display/typography';
import { AccordionExpandContext } from '../level-1';
import { StyledAccordionWrapper, StyledHeader, StyledPanel, StyledPanelContentWrapper } from './style';

export type Props = PropsWithChildren<
  {
    title: string;
    isInitiallyOpen?: boolean;
    toggleOpen?: boolean;
  } & FileSGProps &
    Partial<Pick<HTMLAttributes<HTMLDivElement>, 'id'>>
>;

export const Level2Accordion = ({ title, isInitiallyOpen = false, toggleOpen, children, className, id, ...rest }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const { accordionDetailsSpring, ref, toggleExpand, isExpanded, isExpandedAndRerendered } = useAccordionAnimation({
    isInitiallyOpen,
    toggleOpen,
  });

  const { height } = accordionDetailsSpring;

  const isParentExpanded = useContext(AccordionExpandContext);

  useEffect(() => {
    if (isParentExpanded === false && isExpanded) {
      toggleExpand();
    }
  }, [isExpanded, isParentExpanded, toggleExpand]);

  return (
    <StyledAccordionWrapper className={className} data-testid={rest['data-testid'] ?? TEST_IDS.ACCORDION_LEVEL_2} id={id}>
      <StyledHeader onClick={toggleExpand} data-testid={TEST_IDS.ACCORDION_LEVEL_2_HEADER} aria-expanded={isExpanded}>
        <Icon icon={isExpanded ? 'sgds-icon-minus' : 'sgds-icon-plus'} size="ICON_NORMAL" color={Color.PURPLE_DEFAULT} />

        <Typography variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'} bold="SEMI">
          {title}
        </Typography>
      </StyledHeader>

      <StyledPanel style={{ height: isExpandedAndRerendered ? 'auto' : height }} data-testid={TEST_IDS.ACCORDION_LEVEL_2_CONTENT}>
        <StyledPanelContentWrapper ref={ref}>
          {isValidElement(children) ? (
            children
          ) : (
            <Typography variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{children}</Typography>
          )}
        </StyledPanelContentWrapper>
      </StyledPanel>
    </StyledAccordionWrapper>
  );
};
