import { Bold, Color, Typography } from '@filesg/design-system';
import styled from 'styled-components';

import { Tabs } from '../../../components/navigation/tabs';
import { PAGE_DESCRIPTOR_CONTAINER_HEIGHT, PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE } from '../../../consts';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;

  max-width: 100%;
`;

export const StyledAllActivitiesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S80};
  min-width: 0;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};
  }
`;
type Props = {
  hasItems: boolean;
};

export const StyledPageDescriptorContainer = styled.div<Props>`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
  height: ${PAGE_DESCRIPTOR_CONTAINER_HEIGHT / 16}rem;

  position: ${({ hasItems }) => {
    if (hasItems) {
      return 'sticky';
    } else {
      return 'relative';
    }
  }};
  top: 0;
  background-color: ${Color.WHITE};
  z-index: 100;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S24 } = theme.FSG_SPACING;
      return S24 + ' ' + S16;
    }};
    height: ${PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE / 16}rem;
  }
`;

export const StyledContainer = styled.div`
  margin: ${({ theme }) => 0 + ' ' + theme.FSG_SPACING.S24};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    margin: ${({ theme }) => 0 + ' ' + theme.FSG_SPACING.S16};
  }
`;

export const StyledInfoContainer = styled(StyledContainer)`
  max-width: 640px;
`;

type TabProps = {
  topInPx: number;
};
export const StyledTabs = styled(Tabs)<TabProps>`
  ${({ topInPx, theme }) => {
    if (topInPx) {
      return `
      .fsg-tab-title-container {
        position: sticky;
        z-index: 100;
        top: ${(PAGE_DESCRIPTOR_CONTAINER_HEIGHT + topInPx) / 16}rem;
        @media screen and (max-width: calc(${theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
          top: ${(PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE + topInPx) / 16}rem; 
        }
      }
      `;
    }
  }};
`;

export const StyledBold = styled(Bold)`
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
`;

export const StyledTagTypography = styled(Typography)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const StyledTagsContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
`;
