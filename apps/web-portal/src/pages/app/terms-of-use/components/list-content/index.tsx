import { FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { isValidElement } from 'react';

import { ListContent } from '../../../../../typings';
import { termsOfUseListContent } from '../../consts';
import { StyledLi, StyledLiWithoutNumbering, StyledOl, StyledOverallOl, StyledText } from './style';

const ALPHABET_CHAR_CODE_A = 65;

export function TermsOfUseListContent() {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  function generateNumberingLabel(currentNumberingList: string[], isSameLevelSubsection: boolean, currentSubsectionCharCode: number) {
    const currentLevelIndex = currentNumberingList.length - 1;
    const currentLevelIndexCount = parseInt(currentNumberingList[currentLevelIndex]);

    // If same level subsection, append alphabet without increment
    if (isSameLevelSubsection) {
      return currentNumberingList.join('.') + String.fromCharCode(currentSubsectionCharCode);
    }

    // Else increase count
    currentNumberingList[currentLevelIndex] = `${currentLevelIndexCount + 1}`;
    return currentNumberingList.join('.');
  }

  /**
   * Function that recursively look through a ListContent array to render a numbered list
   * List indents and renders numbering with a period between each level
   * Allows for:
   *  1) Non-indent alphabet subsection (isSameLevelSubsection)
   *  2) Non-numbered descriptions (ListContent without title, only)
   *
   * e.g.
   * 1.   Lorem
   *      1.1. Lorem
   *        1.1.1. Lorem
   * 2.   Lorem
   *      Lorem ipsum
   * 3.   Lorem
   * 3A.  Lorem
   *      3A.1. Lorem
   *      Lorem ipsum
   *
   * @param listContent Content to be rendered in the current level. Maybe be in the form of string, JSX Element, an array that contains either or both, or another listContent array to recursively render the next level
   * @param numberingList List numbering in string array form, e.g. ['1', '2', '1'] would return 1.2.1 in the list
   */
  function renderContentList(
    listContent: string | JSX.Element | Array<string | JSX.Element | ListContent>,
    numberingList: string[] = ['0'],
  ) {
    // Resets subsection alphabet for each level
    let alphabetIndexCharCode = ALPHABET_CHAR_CODE_A;

    // If not array, renders <Text> instead of <li> (no numbering)
    if (typeof listContent === 'string' || isValidElement(listContent)) {
      return (
        <StyledLiWithoutNumbering key={`terms-content-base`}>
          <StyledText variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</StyledText>
        </StyledLiWithoutNumbering>
      );
    }

    // Else map the array of content
    return (listContent as ListContent[]).map((listContent) => {
      const { isSameLevelSubsection, title, content } = listContent;

      const numberingListLabel = generateNumberingLabel(numberingList, !!isSameLevelSubsection, alphabetIndexCharCode);

      // If same level subsection, increment alphabetIndex char code
      if (isSameLevelSubsection) {
        alphabetIndexCharCode++;
      } else {
        // Else, replace numberingList with updated list, then reset alphabet index char code
        numberingList = numberingListLabel.split('.');
        alphabetIndexCharCode = ALPHABET_CHAR_CODE_A;
      }

      // Create new numberingList for next level from generated label
      const newNumberingList = [...numberingListLabel.split('.'), '0'];

      // If string or element, return in list
      if (typeof listContent === 'string' || isValidElement(listContent)) {
        return (
          <StyledLi key={`terms-content-${numberingListLabel}`} numbering={numberingListLabel}>
            <Typography variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</Typography>
          </StyledLi>
        );
      }

      // Else map ol within li, and recursively call renderContentList
      return title ? (
        <StyledLi key={`terms-content-${numberingListLabel}`} numbering={numberingListLabel}>
          {title}
          <StyledOl>{renderContentList(content, newNumberingList)}</StyledOl>
        </StyledLi>
      ) : (
        content && renderContentList(content, newNumberingList)
      );
    });
  }

  return <StyledOverallOl>{renderContentList(termsOfUseListContent)}</StyledOverallOl>;
}
