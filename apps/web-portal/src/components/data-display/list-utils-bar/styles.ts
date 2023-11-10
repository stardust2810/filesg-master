import { Color } from '@filesg/design-system';
import styled from 'styled-components';

import { PAGE_DESCRIPTOR_CONTAINER_HEIGHT, PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE } from '../../../consts';

export const StyledListUtilsBarContainer = styled.div<{ isSticky: boolean }>`
  position: ${({ isSticky }) => (isSticky ? 'sticky' : 'auto')};
  top: ${PAGE_DESCRIPTOR_CONTAINER_HEIGHT / 16}rem;
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24} !important;
  padding-left: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-right: ${({ theme }) => theme.FSG_SPACING.S24};
  background-color: ${Color.WHITE};
  z-index: 100;

  display: flex;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    top: ${PAGE_DESCRIPTOR_CONTAINER_HEIGHT_MOBILE / 16}rem;
    padding-left: ${({ theme }) => theme.FSG_SPACING.S16};
    padding-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
