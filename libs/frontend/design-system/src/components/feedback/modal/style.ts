import styled from 'styled-components';

import { ModalSize, Position } from '../../../utils/typings';
import { Typography } from '../../data-display/typography';

const MODAL_SMALL_WIDTH_IN_PX = 432;
const MODAL_MEDIUM_WIDTH_IN_PX = 660;

export const StyledModalContainer = styled.div`
  align-items: baseline;
  padding-top: ${({ theme }) => theme.FSG_SPACING.S40};
`;

export const StyledModalContentContainer = styled.div<{ position?: Position; size: ModalSize }>`
  display: flex;
  z-index: 250;
  max-width: 100%;

  position: absolute;
  top: ${({ position }) => position?.top && `${position.top}px`};
  bottom: ${({ position }) => position?.bottom && `${position.bottom}px`};
  left: ${({ position }) => position?.left && `${position.left}px`};
  right: ${({ position }) => position?.right && `${position.right}px`};

  .fsg-modal-card {
    width: ${({ size }) => (size === 'MEDIUM' ? `${MODAL_MEDIUM_WIDTH_IN_PX / 16}rem` : `${MODAL_SMALL_WIDTH_IN_PX / 16}rem`)};
  }
`;

export const StyledModalCard = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  border-width: 0.1rem;
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  max-height: calc(100vh - (2 * ${({ theme }) => theme.FSG_SPACING.S40}));

  margin: ${({ theme }) => 0 + ' ' + theme.FSG_SPACING.S16};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.MOBILE} - 1px)) {
    margin: 0;
  }
`;

export const StyledModalHeader = styled.header`
  display: flex;
  align-items: flex-start;
  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S16 + ' ' + S24;
  }};
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  border-bottom: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S12, S16 } = theme.FSG_SPACING;
      return S12 + ' ' + S16;
    }};
  }
`;

export const StyledModalHeaderTitle = styled(Typography)`
  flex-grow: 1;
  /* flex-shrink: 0; */
`;

export const StyledModalBody = styled.section`
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: ${({ theme }) => theme.FSG_SPACING.S16};
  padding: ${({ theme }) => theme.FSG_SPACING.S24};

  flex: 1;
  overflow: auto;
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledModalFooter = styled.footer`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};

  border-top: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S16 + ' ' + S24;
  }};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => theme.FSG_SPACING.S12 + ' ' + theme.FSG_SPACING.S16};
  }
`;
