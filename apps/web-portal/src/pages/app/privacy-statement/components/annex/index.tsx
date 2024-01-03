import { FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { isValidElement } from 'react';

import { ListContent } from '../../../../../typings';
import { privacyStatementAnnex } from '../../consts';
import { StyledLi, StyledLiWithoutNumbering, StyledOl, StyledOverallOl, StyledText, StyledTitleContainer } from './style';

export function PrivacyStatementAnnex() {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  function renderListContent(listContent, parentIndex?) {
    if (typeof listContent === 'string' || isValidElement(listContent)) {
      return (
        <StyledLiWithoutNumbering key={`privacy-content-${parentIndex ? parentIndex + '-0' : '0'}`} style={{ listStyle: 'none' }}>
          <StyledText variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</StyledText>
        </StyledLiWithoutNumbering>
      );
    }

    return (listContent as ListContent[]).map((listContent, index) => {
      if (typeof listContent === 'string' || isValidElement(listContent)) {
        return (
          <StyledLi key={`privacy-content-${parentIndex ? parentIndex + '-' + index : index}`}>
            <Typography variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</Typography>
          </StyledLi>
        );
      }

      const { title, content } = listContent;

      return title ? (
        <StyledLi key={`privacy-content-${parentIndex ? parentIndex + '-' + index : index}`}>
          {title}
          {content && <StyledOl>{renderListContent(content, index)}</StyledOl>}
        </StyledLi>
      ) : (
        content && renderListContent(content, index)
      );
    });
  }

  return (
    <>
      <StyledTitleContainer id="annex">
        <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} bold="FULL">
          ANNEX
        </Typography>
      </StyledTitleContainer>
      <StyledOverallOl>{renderListContent(privacyStatementAnnex)}</StyledOverallOl>
    </>
  );
}
