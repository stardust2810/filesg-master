import { FileTable, Tag, TextButton } from '@filesg/design-system';
import styled from 'styled-components';

import { ListButtonMenu } from '../../../../../components/navigation/list-button-menu';
import { PAGE_DESCRIPTOR_CONTAINER_HEIGHT, PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE } from '../../../../../consts';
import { TableStylingProps } from '.';
type StylingProps = TableStylingProps;
const UTIL_BAR_HEIGHT = 56;

export const StyledTable = styled(FileTable)<StylingProps>`
  ${({ topInPx, theme }) => {
    if (topInPx) {
      return `
    .ReactVirtualized__Table__headerRow {
      position: sticky;
      z-index: 100;
      top: ${({ hasSelectedItem }) => {
        if (hasSelectedItem) {
          return (PAGE_DESCRIPTOR_CONTAINER_HEIGHT + UTIL_BAR_HEIGHT) / 16;
        }
        return PAGE_DESCRIPTOR_CONTAINER_HEIGHT / 16;
      }}rem;
      top: ${(PAGE_DESCRIPTOR_CONTAINER_HEIGHT + topInPx) / 16}rem;
      @media screen and (max-width: calc(${theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
        top: ${(PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE + topInPx) / 16}rem; 
      }
    }`;
    }
  }};
`;

export const StyledIconTextContainer = styled.div`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  & > :nth-child(1) {
    padding-right: ${({ theme }) => theme.FSG_SPACING.S4};
  }

  @media screen and (max-width: 599px) {
    gap: ${({ theme }) => theme.FSG_SPACING.S4};
  }
`;

export const StyledTextButton = styled(TextButton)`
  background-color: inherit;
  max-width: -webkit-fill-available;
`;

export const StyledFileNameSpan = styled.span`
  display: flex;
`;

export const StyledListButtonMenu = styled(ListButtonMenu)`
  & > * {
    background-color: inherit;
  }
`;

export const StyledTag = styled(Tag)`
  border: ${({ theme }) => {
    return `1px solid ${theme.FSG_COLOR.GREYS.GREY10}`;
  }};
`;
