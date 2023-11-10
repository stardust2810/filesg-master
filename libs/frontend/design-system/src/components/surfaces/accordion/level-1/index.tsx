import React, { createContext, HTMLAttributes, isValidElement, PropsWithChildren } from 'react';

import { useAccordionAnimation } from '../../../../hooks/useAccordionAnimation';
import { useShouldRender } from '../../../../hooks/useShouldRender';
import { Color } from '../../../../styles/color';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../../utils/constants';
import { FileSGProps } from '../../../../utils/typings';
import { Icon } from '../../../data-display/icon';
import { Typography } from '../../../data-display/typography';
import { StyledAccordionWrapper, StyledHeader, StyledIconWrapper, StyledPanel, StyledPanelContentWrapper } from './style';

export type Props = PropsWithChildren<
  {
    title: string;
    isInitiallyOpen?: boolean;
    toggleOpen?: boolean;
  } & FileSGProps &
    Partial<Pick<HTMLAttributes<HTMLDivElement>, 'id'>>
>;

export const AccordionExpandContext = createContext<boolean | null>(null);

export const Level1Accordion = ({ title, isInitiallyOpen = false, toggleOpen, children, className, id, ...rest }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const { accordionDetailsSpring, ref, toggleExpand, isExpanded, isExpandedAndRerendered } = useAccordionAnimation({
    isInitiallyOpen,
    toggleOpen,
  });

  const { height } = accordionDetailsSpring;

  return (
    <StyledAccordionWrapper className={className} data-testid={rest['data-testid'] ?? TEST_IDS.ACCORDION_LEVEL_1} id={id}>
      <StyledHeader onClick={toggleExpand} data-testid={TEST_IDS.ACCORDION_LEVEL_1_HEADER} aria-expanded={isExpanded}>
        <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} bold="SEMI">
          {title}
        </Typography>

        <StyledIconWrapper $rotate={isExpanded}>
          <Icon icon="sgds-icon-chevron-down" size="ICON_NORMAL" color={Color.PURPLE_DEFAULT} />
        </StyledIconWrapper>
      </StyledHeader>

      <StyledPanel style={{ height: isExpandedAndRerendered ? 'auto' : height }} data-testid={TEST_IDS.ACCORDION_LEVEL_1_CONTENT}>
        <StyledPanelContentWrapper ref={ref}>
          <AccordionExpandContext.Provider value={isExpanded}>
            {isValidElement(children) ? (
              children
            ) : (
              <Typography variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{children}</Typography>
            )}
          </AccordionExpandContext.Provider>
        </StyledPanelContentWrapper>
      </StyledPanel>
    </StyledAccordionWrapper>
  );
};
