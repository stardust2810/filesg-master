import { FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { isValidElement } from 'react';

import { ListContent } from '../../../../../typings';
import { termsOfUseSchedule } from '../../consts';
import { StyledLi, StyledOl, StyledOverallOl, StyledText, StyledTitleContainer } from './style';

export function TermsOfUseSchedule() {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  function renderListContent(listContent) {
    if (typeof listContent === 'string' || isValidElement(listContent)) {
      return <StyledText variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</StyledText>;
    }

    return (listContent as ListContent[]).map((listContent, index) => {
      if (typeof listContent === 'string' || isValidElement(listContent)) {
        return (
          <StyledLi key={`terms-content-${index}`}>
            <Typography variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</Typography>
          </StyledLi>
        );
      }

      const { title, content } = listContent;

      return title ? (
        <StyledLi key={`terms-content-${index}`}>
          {title}
          {content && <StyledOl>{renderListContent(content)}</StyledOl>}
        </StyledLi>
      ) : (
        content && renderListContent(content)
      );
    });
  }

  return (
    <>
      <StyledTitleContainer id="schedule">
        <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} bold="FULL">
          SCHEDULE
        </Typography>
      </StyledTitleContainer>
      <StyledOverallOl>{renderListContent(termsOfUseSchedule)}</StyledOverallOl>
    </>
  );
}
