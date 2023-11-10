import styled from 'styled-components';

import { Container } from '../../layout/container';

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: 0.5rem;
  }

  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S24 + ' ' + S16;
  }};
`;

export const StyledContainer = styled(Container)`
  width: 100%;
`;
export const StyledBody = styled.div`
  padding: 1rem;
`;
export const StyledColorBody = styled.div`
  padding-right: 1rem;
`;

export const ColorContainer = styled.div<{ color: string }>`
  height: 50px;
  width: 8vw;
  min-width: 120px;
  background-color: ${({ color }) => color};
  border: ${({ color }) => {
    if (color === '#FFFFFF') {
      return '1px solid #EBEBEB';
    }
    return '';
  }};
`;
