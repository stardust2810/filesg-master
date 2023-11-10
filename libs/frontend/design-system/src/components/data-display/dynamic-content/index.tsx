import { ContentOnlyType, TemplateContent, TitleWithContentType } from '@filesg/common';
import { Typography } from '@filesg/design-system';
import { StyledDynamicContent, StyledOl, StyledSection, StyledUl } from './style';

export type Props = {
  dynamicContent: TemplateContent;
};

function isContentOnly(inputContent: ContentOnlyType | TitleWithContentType): inputContent is ContentOnlyType {
  const { title, numberingTitleContent } = inputContent as TitleWithContentType;
  return title === undefined && numberingTitleContent === undefined;
}

function renderContent(inputContent: ContentOnlyType | TitleWithContentType, parentIndex?: string) {
  if (isContentOnly(inputContent)) {
    const { content, contentType } = inputContent;

    switch (contentType) {
      case 'ORDERED':
        return (
          <StyledOl key={parentIndex}>
            {content.map((paragraphy, index) => {
              return (
                <li key={`ordered-list-${parentIndex}-item-${index}`}>
                  <Typography variant={'BODY'}>{paragraphy}</Typography>
                </li>
              );
            })}
          </StyledOl>
        );
      case 'UNORDERED':
        return (
          <StyledUl key={parentIndex}>
            {content.map((paragraphy, index) => {
              return (
                <li key={`unordered-list-${parentIndex}-item-${index}`}>
                  <Typography variant={'BODY'}>{paragraphy}</Typography>
                </li>
              );
            })}
          </StyledUl>
        );

      default:
        return (
          <StyledSection key={`paragraph-${parentIndex}`}>
            {content.map((paragraphy, index) => (
              <Typography key={`paragraph-${parentIndex}-${index}`} variant={'BODY'}>
                {paragraphy}
              </Typography>
            ))}
          </StyledSection>
        );
    }
  }

  const { isContentNumberingTitle } = inputContent;

  if (isContentNumberingTitle) {
    const { numberingTitleContent } = inputContent;
    return (
      <StyledSection key={parentIndex}>
        <StyledOl>
          {numberingTitleContent.map((numberedContent, index) => {
            const { title, content } = numberedContent;
            return (
              <li key={`ordered-list-${parentIndex}-item-${index}`}>
                <Typography variant={'BODY'} bold={isTitleBold ? 'FULL' : undefined}>
                  {title}
                </Typography>
                {content.map((childContent, index) => renderContent(childContent, parentIndex + index.toString()))}
              </li>
            );
          })}
        </StyledOl>
      </StyledSection>
    );
  }

  const { content, isTitleBold, title } = inputContent;
  return (
    <StyledSection key={parentIndex}>
      <Typography variant={'BODY'} bold={isTitleBold ? 'FULL' : undefined}>
        {title}
      </Typography>
      {content.map((childContent, index) => renderContent(childContent, parentIndex + index.toString()))}
    </StyledSection>
  );
}

export const DynamicContent = ({ dynamicContent }: Props) => {
  return <StyledDynamicContent>{dynamicContent.map((content, index) => renderContent(content, index.toString()))}</StyledDynamicContent>;
};
