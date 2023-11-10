import { Tag } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledTag = styled(Tag)`
  border: ${({ theme }) => {
    return `1px solid ${theme.FSG_COLOR.GREYS.GREY10}`;
  }};
`;
