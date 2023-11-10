import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const StyledAccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  border-bottom: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
`;

export const StyledHeader = styled.button`
  display: flex;
  flex-direction: row;

  align-items: flex-start;
  justify-content: space-between;

  width: 100%;

  gap: ${({ theme }) => theme.FSG_SPACING.S48};
  cursor: pointer;
  padding-top: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    gap: ${({ theme }) => theme.FSG_SPACING.S24};

    padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    gap: ${({ theme }) => theme.FSG_SPACING.S16};
    padding: ${({ theme }) => {
      const { S24 } = theme.FSG_SPACING;
      return `${S24} 0`;
    }};
  }
`;

export const StyledIconWrapper = styled.div<{ $rotate: boolean }>`
  transform: rotate(0deg);
  transition: all 0.3s ease-out;
  ${(props) => props.$rotate && 'transform: rotate(180deg)'};

  padding: ${({ theme }) => {
    const { S4 } = theme.FSG_SPACING;
    return `${S4} 0`;
  }};
`;

export const StyledPanel = styled(animated.div)`
  overflow: hidden;
`;

export const StyledPanelContentWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};
`;
