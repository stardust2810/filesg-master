import { Tooltip } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S4};
  word-wrap: break-word;
`;

export const StyledFieldWrapper = styled.div`
  display: flex;
  > :not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S4};
  }
`;

export const StyledTooltip = styled(Tooltip)`
  font-weight: 400;
`;
