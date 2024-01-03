import { Dropzone, TextButton } from '@filesg/design-system';
import styled from 'styled-components';

import { Tabs } from '../../../../../components/navigation/tabs';
export const StyledOaIntroWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledHeader = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24} 0;
  flex: 1;
  display: flex;
  justify-content: center;
`;

export const StyledTabTitleLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  p + span,
  span + span {
    margin-left: ${({ theme }) => theme.FSG_SPACING.S16};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    p + span,
    span + span {
      margin-left: ${({ theme }) => theme.FSG_SPACING.S8};
    }
  }
`;
export const StyledTabs = styled(Tabs)`
  flex: 1;

  .fsg-tab-title-container {
    background-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTEST};
    text-align: center;
    padding: 0;
    & > li {
      flex: 1;
    }
    height: auto;
    border-bottom: none;
    border-radius: 30px;
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }

  .fsg-tab-title {
    padding: ${({ theme }) => theme.FSG_SPACING.S16} 0;
    width: 100%;
    color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DARKER};
    height: auto;
    border-bottom: none;
    border-radius: 30px;
    &:hover {
      background: none;
      border-bottom: none;
    }

    @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
      padding: ${({ theme }) => theme.FSG_SPACING.S12} 0;
    }
  }

  .fsg-tab-title-active {
    color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
    border-bottom: none;
    transition: color 500ms ease-in-out;

    &:hover {
      border-bottom: none;
    }
  }

  .fsg-tab-title-selector {
    border-radius: 30px;
    left: 0; // override default 24px
    transition: all 500ms ease;
    background-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
    border: none; // override border bottom
    z-index: 1;
    bottom: unset; // override bottom: 0
    height: 100%;
  }
`;

export const StyledDropzone = styled(Dropzone)`
  height: 240px;
`;

export const StyledTextButton = styled(TextButton)`
  display: inline;
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_MOBILE})) {
    display: flex;
  }
`;
