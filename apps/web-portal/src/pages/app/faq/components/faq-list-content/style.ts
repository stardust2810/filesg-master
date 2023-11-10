import { Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledUnorderedList = styled.ul`
  display: flex;
  flex-direction: column;

  list-style-type: disc;
  list-style-position: outside;
  margin-left: ${({ theme }) => theme.FSG_SPACING.S32};
`;

export const StyledOrderedList = styled.ol`
  margin-left: ${({ theme }) => theme.FSG_SPACING.S32};
`;

export const StyledTitle = styled(Typography)`
  & + * {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledOrderedListWrapper = styled.ol<{ toBoldTitle?: boolean }>`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  list-style-position: inside;

  > li::marker {
    font-weight: ${(props) => (props.toBoldTitle ? 700 : 400)};
  }
`;

export const StyledAccordionGroup = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;
