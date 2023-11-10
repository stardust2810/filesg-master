import { Level2Accordion, Typography } from '@filesg/design-system';
import React from 'react';
import { isValidElement, useCallback } from 'react';

import { ListContent } from '../../../../../typings';
import {
  AnswerContent,
  ContentFormat,
  FAQ_CONTENT_TYPE,
  FaqItemAnswerContent,
  FormattedAnswerContent,
  NumberingTitleFormattedAnswerContent,
} from '../../consts';
import {
  StyledAccordionGroup,
  StyledContentWrapper,
  StyledOrderedList,
  StyledOrderedListWrapper,
  StyledTitle,
  StyledUnorderedList,
} from './style';

interface Props {
  answerContents: FaqItemAnswerContent[];
  toggleOpen?: boolean;
}

const isContentStringOrElement = (
  content: string | JSX.Element | Array<string | JSX.Element | ListContent>,
): content is string | JSX.Element => {
  return typeof content === 'string' || isValidElement(content);
};

export function FaqListContent({ answerContents, toggleOpen }: Props) {
  const renderContent = (content: AnswerContent, index?: number) => {
    let render: JSX.Element | JSX.Element[];

    if (isContentStringOrElement(content)) {
      render = isValidElement(content) ? content : <Typography variant="PARAGRAPH">{content}</Typography>;
    } else {
      render = (
        <StyledContentWrapper>
          {content.map((item, index) =>
            isValidElement(item) ? (
              <React.Fragment key={`faq-content-item-${index}`}>{item}</React.Fragment>
            ) : (
              <Typography variant="PARAGRAPH" key={`faq-content-item-${index}`}>
                {item}
              </Typography>
            ),
          )}
        </StyledContentWrapper>
      );
    }

    return <div key={`faq-answer-section-${index}`}>{render}</div>;
  };

  const renderFormattedContent = useCallback((content: FormattedAnswerContent, contentFormat: ContentFormat, index?: number) => {
    return contentFormat === 'UNORDERED' ? (
      <StyledUnorderedList key={`faq-unordered-list-${index}`}>
        {content.map((item, index) => (
          <li key={`faq-unordered-list-item-${index}`}>{renderContent(item, index)}</li>
        ))}
      </StyledUnorderedList>
    ) : (
      <StyledOrderedList key={`faq-ordered-list-${index}`}>
        {content.map((item, index) => (
          <li key={`faq-ordered-list-item-${index}`}>{renderContent(item, index)}</li>
        ))}
      </StyledOrderedList>
    );
  }, []);

  const renderAnswerContent = useCallback(
    (answerContent: FaqItemAnswerContent, index?: number) => {
      const { type, content } = answerContent;

      switch (type) {
        case FAQ_CONTENT_TYPE.CONTENT_ONLY: {
          const { contentFormat } = answerContent;
          return contentFormat && Array.isArray(content)
            ? renderFormattedContent(content, contentFormat, index)
            : renderContent(content, index);
        }

        case FAQ_CONTENT_TYPE.CONTENT_WITH_TITLE: {
          const { title, toBoldTitle } = answerContent;

          return (
            <div key={`faq-answer-section-${index}`}>
              <StyledTitle variant="PARAGRAPH" bold={toBoldTitle ? 'FULL' : undefined}>
                {title}
              </StyledTitle>
              {renderContent(content, index)}
            </div>
          );
        }

        case FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_TITLE: {
          const { title, toBoldTitle, contentFormat } = answerContent;

          return (
            <div key={`faq-answer-section-${index}`}>
              <StyledTitle variant="PARAGRAPH" bold={toBoldTitle ? 'FULL' : undefined}>
                {title}
              </StyledTitle>
              {renderFormattedContent(content, contentFormat, index)}
            </div>
          );
        }

        case FAQ_CONTENT_TYPE.FORMATTED_CONTENT_WITH_NUMBERING_TITLE: {
          const { toBoldTitle, contentFormat } = answerContent;

          return (
            <div key={`faq-answer-section-${index}`}>
              <StyledOrderedListWrapper key={`faq-ordered-list-${index}`} toBoldTitle={toBoldTitle}>
                {(content as NumberingTitleFormattedAnswerContent).map(({ title, content }, index) => (
                  <li key={`faq-ordered-list-item-${index}`}>
                    <StyledTitle variant="PARAGRAPH" bold={toBoldTitle ? 'FULL' : undefined}>
                      {title}
                    </StyledTitle>
                    {renderFormattedContent(content, contentFormat, index)}
                  </li>
                ))}
              </StyledOrderedListWrapper>
            </div>
          );
        }

        case FAQ_CONTENT_TYPE.ACCORDION_GROUP: {
          return (
            <div key={`faq-answer-section-${index}`}>
              <StyledAccordionGroup>
                {content.map((accordionDetails, accordionIndex) => {
                  const { id, title, content } = accordionDetails;
                  return (
                    <Level2Accordion id={id} key={`faq-answer-section-${index}-${accordionIndex}`} title={title} toggleOpen={toggleOpen}>
                      <FaqListContent key={`faq-answer-section-${index}-${accordionIndex}-content`} answerContents={content} />
                    </Level2Accordion>
                  );
                })}
              </StyledAccordionGroup>
            </div>
          );
        }

        default:
          return null;
      }
    },
    [renderFormattedContent, toggleOpen],
  );

  return <>{answerContents.map((answerContent, index) => renderAnswerContent(answerContent, index))}</>;
}
