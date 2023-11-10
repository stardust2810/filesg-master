/* eslint-disable sonarjs/no-identical-functions */
import styled from 'styled-components';

import { Button } from '../button';
import { Props } from '.';

type StyleProps = Pick<Props, 'iconColor' | 'round'>;

export const StyledButton = styled(Button)<StyleProps>`
  min-width: fit-content;
  padding: ${({ theme, size }) => {
    if (size === 'NORMAL') {
      return theme.FSG_SPACING.S12;
    }
    return theme.FSG_SPACING.S6;
  }};
  color: ${({ iconColor }) => iconColor ?? ''};

  ${({ round }) => round && 'border-radius: 100%;'}

  & > span:first-child {
    color: ${({ iconColor }) => iconColor ?? ''};
  }

  & > span:nth-child(2) {
    display: none;
  }
`;
