import styled from 'styled-components';

import { Props } from '.';

export const StyledB = styled.b<Props>`
  font-weight: ${({ type: bold }) => {
    if (bold === 'FULL') {
      return 700;
    }

    if (bold === 'SEMI') {
      return 600;
    }

    if (bold === 'MEDIUM') {
      return 500;
    }

    return 400;
  }};
`;
