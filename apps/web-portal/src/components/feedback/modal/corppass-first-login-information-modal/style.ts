import styled from 'styled-components';
import { Modal } from '../../../../../../../libs/frontend/design-system/src';

export const StyledBody = styled(Modal.Body)`
  row-gap: 1.5rem;
`;

export const StyledInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
`;

export const StyledFooter = styled(Modal.Footer)`
  flex-direction: row;
  justify-content: right;
`;
