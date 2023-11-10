import styled from 'styled-components';

import { Icon } from '../icon';
import { Typography } from '../typography';

const SGDS_LINK_COLOR = '#2F5FD0';
const SGDS_LINK_COLOR_HOVER = '#3877ff';

const MASTHEAD_CUSTOM_BREAKPOINT = '480px';
const MASTHEAD_CUSTOM_BREAKPOINT_MAIN_FONT_SIZE = '0.65rem';
const MASTHEAD_CUSTOM_BREAKPOINT_SECONDARY_FONT_SIZE = '0.625rem';

export const StyledWrapper = styled.div`
  width: 100%;
  background-color: #f0f0f0;

  padding: ${({ theme }) => {
    const { S4, S48 } = theme.FSG_SPACING;
    return S4 + ' ' + S48;
  }};

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding: ${({ theme }) => {
      const { S4, S24 } = theme.FSG_SPACING;
      return S4 + ' ' + S24;
    }};
  }

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S4, S16 } = theme.FSG_SPACING;
      return S4 + ' ' + S16;
    }};
  }
`;

export const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S8};
  }

  .masthead-custom {
    @media only screen and (max-width: calc(${MASTHEAD_CUSTOM_BREAKPOINT})) {
      font-size: ${MASTHEAD_CUSTOM_BREAKPOINT_MAIN_FONT_SIZE};
    }
  }
`;

export const StyledButton = styled.button`
  display: flex;
  align-items: center;
  color: ${SGDS_LINK_COLOR};

  :hover {
    color: ${SGDS_LINK_COLOR_HOVER};
  }

  .masthead-custom {
    @media only screen and (max-width: calc(${MASTHEAD_CUSTOM_BREAKPOINT})) {
      font-size: ${MASTHEAD_CUSTOM_BREAKPOINT_SECONDARY_FONT_SIZE};
    }
  }
`;

export const StyledUnderlinedTypography = styled(Typography)`
  text-decoration: underline;
`;

export const StyledRotatingIcon = styled(Icon)<{ $rotate: boolean }>`
  transform: rotate(0deg);
  transition: all 0.3s ease-out;
  ${(props) => props.$rotate && 'transform: rotate(-180deg)'};

  height: auto;

  font-size: 12px !important;

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE})) {
    font-size: 14px !important;
  }
`;

// IDENTIFICATION METHODS DISPLAY
export const StyledIdentificationMethodsContainer = styled.div`
  display: grid;

  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: ${({ theme }) => theme.FSG_SPACING.S16};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S32};

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE})) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 10rem;
    margin: ${({ theme }) => theme.FSG_SPACING.S40} 0;
  }
`;
export const StyledIdentificationMethod = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  > *:not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }

  span > svg {
    height: auto;
    width: 12px;
  }

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE})) {
    span > svg {
      height: auto;
      width: 18px;
    }
  }
`;

export const StyledIdentificationMethodContent = styled.div`
  display: flex;
  flex-direction: column;

  padding-right: ${({ theme }) => theme.FSG_SPACING.S40};

  > *:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
  }

  a {
    color: ${SGDS_LINK_COLOR};
  }
  a:active,
  a:hover {
    color: ${SGDS_LINK_COLOR_HOVER};
  }

  svg {
    height: auto;
    width: 10px;
  }

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE})) {
    svg {
      height: auto;
      width: 16px;
    }
  }
`;
