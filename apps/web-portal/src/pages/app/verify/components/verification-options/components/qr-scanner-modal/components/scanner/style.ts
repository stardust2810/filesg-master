import { HEX_COLOR_OPACITY } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledBodyTextContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledVideoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80 + HEX_COLOR_OPACITY.P80};
  width: 100%;
  aspect-ratio: 1;
`;
