import { Color, PAGE_MARGIN_STYLES } from '@filesg/design-system';
import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${PAGE_MARGIN_STYLES}
  margin-top: ${({ theme }) => theme.FSG_SPACING.S64};

  @media screen and (max-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP}) {
    margin-top: ${({ theme }) => theme.FSG_SPACING.S32};
  }

  @media screen and (max-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET}) {
    margin-top: ${({ theme }) => theme.FSG_SPACING.S32};
  }
  align-items: center;
`;
export const LogoutInfoContainer = styled.div`
  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S32};
  }

  display: flex;
  flex-direction: column;
`;

export const StyledImage = styled.img`
  height: 192px;
  object-fit: cover;

  border-radius: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledPageInfo = styled.div`
  max-width: 640px;
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;

export const StyledHeader = styled.td`
  background-color: ${Color.GREY10};
  padding: 12px 24px;
  line-height: 24px;
`;

export const StyledData = styled.td`
  font-size: 16px;
  padding: 12px 24px;
  line-height: 24px;
`;

export const StyledRow = styled.tr`
  height: 48px;
  border-bottom: 1px solid #c6c6c6;
`;
