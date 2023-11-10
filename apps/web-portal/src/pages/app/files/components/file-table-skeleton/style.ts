import { Color } from '@filesg/design-system';
import styled from 'styled-components';
type Props = {
  width: 'FILL' | number;
};
export const StyledTable = styled.div`
  display: flex;
`;
export const StyledCol = styled.div<Pick<Props, 'width'>>`
  display: flex;
  flex-direction: column;
  ${({ width }) => {
    if (width === 'FILL') {
      return 'flex: 1';
    } else {
      return `width: ${width}px`;
    }
  }}
`;

export const StyledHeader = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S12};
  height: 48px;
  background-color: ${Color.GREY10};
`;

export const StyledContentRow = styled.div`
  display: flex;
  align-items: center;

  padding: ${({ theme }) => {
    const { S12, S20 } = theme.FSG_SPACING;
    return `${S20} ${S12}`;
  }};

  height: 64px;
`;
