import { Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledSampleWrapper = styled.div`
  display: flex;
  flex-direction: row;

  border-radius: 8px;
  box-shadow: 0 0 0 2px ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20} inset;

  flex: 1;
  overflow: hidden;
`;

export const EmailLabelContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
`;

export const EmailContentContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
  flex: 1;
  display: flex;
  flex-direction: column;

  > *:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;

export const StyledRobotoFieldLabel = styled.div`
  font-family: Roboto;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1rem;
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};
`;

export const StyledRobotoText = styled(Typography)`
  font-family: Roboto;
  white-space: pre-wrap;
`;

export const StyledFieldContainer = styled.div<{ $outlineField?: boolean }>`
  display: flex;
  width: fit-content;
  flex-direction: column;
  outline: ${({ $outlineField, theme }) => ($outlineField ? `1px solid ${theme.FSG_COLOR.DANGER.DEFAULT}` : 'none')};
`;
