import { TextLink } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledUnorderedList = styled.ul`
  list-style-type: disc;
  list-style-position: inside;
  padding-left: ${({ theme }) => theme.FSG_SPACING.S16};
  margin-top: ${({ theme }) => theme.FSG_SPACING.S16};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StypedTextLink = styled(TextLink)`
  display: inline;
`;

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;
