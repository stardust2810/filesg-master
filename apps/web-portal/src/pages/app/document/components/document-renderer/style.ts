import { ErrorInfo } from '@filesg/design-system';
import styled from 'styled-components';

import { MOBILE_BOTTOM_SHEET_TAB_HEIGHT, TABLET_BOTTOM_SHEET_TAB_HEIGHT } from '../../../../../consts';

export const StyledRendererContainer = styled.div`
  position: relative;
  flex: 1 0 0;
  min-height: 0;

  @media screen and (max-width: 1023px) {
    padding-bottom: ${TABLET_BOTTOM_SHEET_TAB_HEIGHT / 16}rem;
  }

  @media screen and (max-width: 599px) {
    padding-bottom: ${MOBILE_BOTTOM_SHEET_TAB_HEIGHT / 16}rem;
  }
`;

export const StyledPlaceholderRenderer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};

  // add padding top ensure loader is at same position for the separate loaders (document & oa loader)
  padding-top: 52px;

  @media screen and (max-width: 599px) {
    padding-top: 40px;
  }
`;

export const StyledInfoContainer = styled.div`
  display: flex;
  align-items: center;

  height: 100%;
`;

export const StyledErrorInfo = styled(ErrorInfo)`
  padding: 0;

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => `0 ${theme.FSG_SPACING.S16}`};
  }
`;
