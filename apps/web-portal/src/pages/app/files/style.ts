import { Color, TextButton, Typography } from '@filesg/design-system';
import styled from 'styled-components';

import { PAGE_DESCRIPTOR_CONTAINER_HEIGHT, PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE } from '../../../consts';

type Props = {
  hasItems: boolean;
};

export const StyledPageDescriptorContainer = styled.div<Props>`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
  min-height: ${PAGE_DESCRIPTOR_CONTAINER_HEIGHT / 16}rem;

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
    min-height: ${PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE / 16}rem;
  }
`;

export const StyledWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

export const StyledBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S80};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};
  }
`;

export const StyledTitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledTableContainer = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

export const StyledTableDisplayContainer = styled.div<{ rows: number }>`
  height: 100%;
`;

export const StyledInfoContainer = styled.div`
  max-width: 640px;

  padding: ${({ theme }) => 0 + ' ' + theme.FSG_SPACING.S24};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => 0 + ' ' + theme.FSG_SPACING.S16};
  }
`;

export const StyledToastText = styled(Typography)`
  word-break: break-word;
`;

export const StyledTextButton = styled(TextButton)`
  padding: ${({ theme }) => {
    const { S6, S16 } = theme.FSG_SPACING;
    return S6 + ' ' + S16;
  }};
`;
