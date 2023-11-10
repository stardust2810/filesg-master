import { Color, Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledLabel = styled(Typography)`
  text-transform: uppercase;
  color: ${Color.GREY60};
`;

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StyledRightSideBarHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledCardHeader = styled.div`
  padding: ${({ theme }) => {
    const { S12, S16 } = theme.FSG_SPACING;
    return S12 + ' ' + S16;
  }};
  background-color: ${Color.GREY10};
`;

export const StyledCardContainer = styled.div`
  max-width: 640px;
  border-radius: ${({ theme }) => theme.FSG_SPACING.S16};
  border: 1px solid ${Color.GREY30};
  overflow: hidden;
  height: fit-content;
`;
export const StyledCardDetailsContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  &:not(:last-child) {
    margin-bottom: ${({ theme }) => {
      return theme.FSG_SPACING.S16;
    }};
  }
`;
