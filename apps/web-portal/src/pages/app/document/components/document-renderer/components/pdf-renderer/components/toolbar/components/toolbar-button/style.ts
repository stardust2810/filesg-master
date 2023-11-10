import { HEX_COLOR_OPACITY } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: transparent;
  border: none;

  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};

  padding: ${({ theme }) => theme.FSG_SPACING.S8};

  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  &:hover {
    background-color: ${({ theme, disabled }) => (disabled ? undefined : theme.FSG_COLOR.SYSTEM.WHITE + HEX_COLOR_OPACITY.P30)};
  }

`;
