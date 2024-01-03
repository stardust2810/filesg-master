import { Modal } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledDateInput = styled.div`
  label {
    display: flex;
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;

export const StyledFooter = styled(Modal.Footer)`
  justify-content: space-between !important;
`;

export const StyledForm = styled.form`
  width: 100%;
  display: flex;
`;
