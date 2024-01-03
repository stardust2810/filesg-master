import { Color } from '@filesg/design-system';
import styled from 'styled-components';
export const Container = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const TabTitleContainer = styled.div`
  position: relative;

  display: flex;
  flex-direction: row;
  padding: 0 ${({ theme }) => theme.FSG_SPACING.S24};
  background-color: ${Color.GREY10};
  border-bottom: 1px solid ${Color.GREY30};

  z-index: 0;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledSelector = styled.div`
  position: absolute;
  z-index: 3;
  bottom: 0;
  border-bottom: 3px solid ${Color.PURPLE_DEFAULT};
`;
