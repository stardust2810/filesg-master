import { Color, Menu, TextButton } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledMenuContent = styled.div`
  background-color: ${Color.WHITE};
`;

export const StyledMenu = styled(Menu)`
  max-width: 15rem; // 240px
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  border-radius: 0px;
  border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  box-shadow: none;
`;

export const StyledUserProfile = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => {
    const { S8, S16, S24 } = theme.FSG_SPACING;
    return `${S16} ${S24} ${S8} ${S24}`;
  }};
  > *:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S12};
  }
`;

export const StyledTextButton = styled(TextButton)`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S4};
`;

export const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.LIGHTEST};
  padding: ${({ theme }) => {
    const { S8, S16, S24 } = theme.FSG_SPACING;
    return `${S16} ${S24} ${S8} ${S24}`;
  }};
`;
