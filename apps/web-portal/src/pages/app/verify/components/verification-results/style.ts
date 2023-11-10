import { Col } from '@filesg/design-system';
import styled from 'styled-components';
export const StyledOaRenderer = styled.div`
  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;
export const StyledResultsRenderer = styled.div`
  border: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  overflow: hidden;
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
`;

export const StyledButtonContainer = styled(Col)`
  margin: auto;
`;
