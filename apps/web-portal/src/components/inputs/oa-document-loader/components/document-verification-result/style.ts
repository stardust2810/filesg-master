import { Icon } from '@filesg/design-system';
import { animated } from '@react-spring/web';
import styled from 'styled-components';

export const StyledWrapper = styled.div``;

export const StyledSummaryContainter = styled.div<{ isValid: boolean; isLoading: boolean; $isExpandable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  position: relative;
  z-index: 3;
  box-shadow: ${({ theme }) => `inset 0px -1px 0px ${theme.FSG_COLOR.GREYS.GREY30}`};

  background-color: ${({ isValid, isLoading, theme }) => {
    const { SUCCESS, DANGER, GREYS } = theme.FSG_COLOR;
    if (isLoading) {
      return GREYS.GREY20;
    }
    if (isValid) {
      return SUCCESS.LIGHTEST;
    }
    return DANGER.LIGHTEST;
  }};

  padding: ${({ theme }) => {
    const { S12, S16, S48 } = theme.FSG_SPACING;

    return `${S12} ${S16} ${S12} ${S48}`;
  }};

  @media screen and (min-width: 600px) and (max-width: 1279px) {
    padding: ${({ theme }) => {
      const { S12, S24 } = theme.FSG_SPACING;

      return S12 + ' ' + S24;
    }};
  }

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => {
      const { S8, S16 } = theme.FSG_SPACING;

      return S8 + ' ' + S16;
    }};
  }
`;

export const StyledTextContainer = styled.div`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledDetailsContainer = styled(animated.div)<{ $isExpandable: boolean; $isVerifying?: boolean }>`
  flex-direction: column;
  align-items: flex-start;

  position: ${({ $isExpandable }) => ($isExpandable ? 'absolute' : 'initial')};

  box-shadow: ${({ $isVerifying, theme }) => !$isVerifying && `inset 0px -1px 0px ${theme.FSG_COLOR.GREYS.GREY30}`};

  overflow: hidden;

  width: 100%;

  z-index: 2;

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
`;

export const StyledResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;

  /* height: inherit; */
  padding: ${({ theme }) => {
    const { S16, S48 } = theme.FSG_SPACING;
    return S16 + ' ' + S48;
  }};

  @media screen and (min-width: 600px) and (max-width: 1279px) {
    padding: ${({ theme }) => {
      const { S16, S24 } = theme.FSG_SPACING;
      return S16 + ' ' + S24;
    }};
  }

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const IssuerIdentityContainer = styled.div`
  display: flex;
  width: 100%;

  overflow-wrap: break-word;
`;

export const StyledAllMessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledMessageWrapper = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledAnimatedLoaderIcon = styled(Icon)`
  animation: rotation 2s infinite linear;

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`;
