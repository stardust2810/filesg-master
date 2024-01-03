import { Modal } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledBody = styled(Modal.Body)`
  row-gap: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledHeaderIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledForm = styled.form`
  overflow: auto;
`;

export const StyledFooter = styled(Modal.Footer)`
  justify-content: space-between !important;
`;
