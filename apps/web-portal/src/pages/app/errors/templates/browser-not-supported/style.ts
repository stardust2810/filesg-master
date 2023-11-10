import styled from 'styled-components';

import { Error } from '../../base';

export const StyledError = styled(Error)`
  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET})) {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
