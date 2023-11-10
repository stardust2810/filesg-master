import styled from 'styled-components';

import { ONBOARDING_FOOTER_HEIGHT, ONBOARDING_FOOTER_HEIGHT_MOBILE } from '../../../../../consts';

const SIGN_UP_FORM_MAX_WIDTH_IN_REM = 42;
export const StyledWrapper = styled.div`
  flex: 1;
  min-height: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`;

export const StyledFormWrapper = styled.div`
  flex: 1 0 0;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-bottom: ${ONBOARDING_FOOTER_HEIGHT_MOBILE}px;

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET})) {
    padding-bottom: ${ONBOARDING_FOOTER_HEIGHT}px;
  }
`;

export const StyledFormContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: ${SIGN_UP_FORM_MAX_WIDTH_IN_REM}rem;
  margin: 0 ${({ theme }) => theme.FSG_SPACING.S16};

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP}) {
    margin: 0 ${({ theme }) => theme.FSG_SPACING.S32};
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP}) {
    margin: 0 ${({ theme }) => theme.FSG_SPACING.S48};
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.LARGE_DESKTOP}) {
    margin: 0 ${({ theme }) => theme.FSG_SPACING.S64};
  }

  @media screen and (min-width: 2560) {
    margin: 0 ${({ theme }) => theme.FSG_SPACING.S96};
  }
`;

export const StyledBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: max-content;

  gap: ${({ theme }) => theme.FSG_SPACING.S24};

  padding: ${({ theme }) => {
    const { S32 } = theme.FSG_SPACING;
    return `${S32} 0`;
  }};

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP}) {
    padding: ${({ theme }) => theme.FSG_SPACING.S48} 0;
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.LARGE_DESKTOP}) {
    padding: ${({ theme }) => theme.FSG_SPACING.S64} 0;
  }

  @media screen and (min-width: 2560) {
    padding: ${({ theme }) => theme.FSG_SPACING.S96} 0;
  }
`;
export const StyledFormInfoContainer = styled.div`
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
export const TermsContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S24};

  padding: ${({ theme }) => theme.FSG_SPACING.S16};

  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
`;

export const AgreementContainer = styled.div`
  display: flex;
`;

export const StyledCtaContainer = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row-reverse;

  width: 100%;
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  box-shadow: ${({ theme }) => `inset 0px 1px 0px ${theme.FSG_COLOR.GREYS.GREY30}`};

  padding: ${({ theme }) => {
    const { S16, S12 } = theme.FSG_SPACING;
    return S12 + ' ' + S16;
  }};

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT}) {
    padding: ${({ theme }) => {
      const { S16, S24 } = theme.FSG_SPACING;
      return S16 + ' ' + S24;
    }};
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP}) {
    padding: ${({ theme }) => {
      const { S16, S48 } = theme.FSG_SPACING;
      return S16 + ' ' + S48;
    }};
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE}) {
    width: 60%;
  }
`;

export const StyledErrorContainer = styled.div`
  display: flex;
  align-items: center;
`;
