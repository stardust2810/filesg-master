import { ErrorInfo } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledErrorInfo = styled(ErrorInfo)`
  padding: ${({ theme }) => `${theme.FSG_SPACING.S64}`};
  margin: auto;

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => {
      const { S16, S32 } = theme.FSG_SPACING;
      return S32 + ' ' + S16;
    }};
  }
`;
