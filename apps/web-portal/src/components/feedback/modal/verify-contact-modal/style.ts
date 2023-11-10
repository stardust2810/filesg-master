import { Modal } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledForm = styled.form`
  overflow: auto;
`;

export const StyledFooter = styled(Modal.Footer)`
  flex-direction: row-reverse;
`;

export const StyledHeaderIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.FSG_SPACING.S8};
`;
