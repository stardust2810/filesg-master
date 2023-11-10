import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const StyledAccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};

  width: 100%;

  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledHeader = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;

  width: 100%;

  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  padding: ${({ theme }) => {
    const { S8, S16 } = theme.FSG_SPACING;
    return S8 + ' ' + S16;
  }};

  gap: ${({ theme }) => theme.FSG_SPACING.S16};

  :hover {
    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
  }

  :focus {
    outline-offset: -2px;
  }
`;

export const StyledPanel = styled(animated.div)`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  border-bottom-left-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  border-bottom-right-radius: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledPanelContentWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
`;
