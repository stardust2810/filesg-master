import { PAGE_MARGIN_STYLES } from '@filesg/design-system';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    flex-direction: column;
    justify-content: flex-start;
  }
`;

export const StyledActivityInfoContainer = styled.div`
  ${PAGE_MARGIN_STYLES}
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S24};
  max-width: 640px;

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP}) {
    width: 640px;
  }
`;

export const StyledSenderInformation = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledIcon = styled.img`
  max-height: 64px;
  max-width: 200px;
`;

export const StyledBreadcrumbLink = styled(NavLink)`
  font-family: ${({ theme }) => theme.FSG_FONT.SMALL.FONT_FAMILY};
  font-size: ${({ theme }) => theme.FSG_FONT.SMALL.SIZE};
  line-height: ${({ theme }) => theme.FSG_FONT.SMALL.LINE_HEIGHT};

  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};

  &:hover {
    text-decoration: underline;
  }
`;

export const StyledActivityMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
