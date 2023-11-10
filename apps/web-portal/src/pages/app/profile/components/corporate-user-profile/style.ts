import { TextButton } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledSectionContainer = styled.div`
  display: flex;
  flex-direction: column;

  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;

export const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledFieldContainer = styled.div`
  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S4};
`;

export const StyledTextButton = styled(TextButton)`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S16};
`;
