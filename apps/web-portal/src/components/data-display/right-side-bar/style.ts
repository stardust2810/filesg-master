import styled from 'styled-components';

import { HEADER_HEIGHT, MASTHEAD_HEIGHT, RIGHT_SIDEBAR_WIDTH } from '../../../consts';

export const RightSideBarContainer = styled.div`
  border-left: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};
  min-width: ${RIGHT_SIDEBAR_WIDTH / 16}rem;
  width: ${RIGHT_SIDEBAR_WIDTH / 16}rem;
`;

export const RightSideBarContentWrapper = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-right: ${({ theme }) => theme.FSG_SPACING.S48};
  position: sticky;
  top: 0;
  max-height: calc(100vh - ${MASTHEAD_HEIGHT / 16}rem - ${HEADER_HEIGHT / 16}rem);
  overflow-y: auto;
`;
