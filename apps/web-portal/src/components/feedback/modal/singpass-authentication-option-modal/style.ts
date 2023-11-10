import { TextLink } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledOption = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.0625rem solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
  row-gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StypedTextLink = styled(TextLink)`
  display: inline;
`;
