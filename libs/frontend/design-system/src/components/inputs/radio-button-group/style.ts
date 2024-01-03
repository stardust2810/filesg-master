import styled from 'styled-components';

import { Variant } from './radio-button';

export const StyledContainer = styled.div<{ $variant?: Variant }>`
  display: flex;
  flex-direction: column;

  // Radio button in radio button group of variant FRAMED will be stretched to fill parent width
  align-items: ${({ $variant }) => ($variant === 'WITH_FRAME' ? 'stretch' : 'flex-start')};

  // label is the container html tag for radio button
  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;
