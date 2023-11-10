import styled from 'styled-components';
import { Modal } from '../../../../../../../libs/frontend/design-system/src';

export const StyledSelectFieldContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledFooter = styled(Modal.Footer)`
  flex-direction: row;
  justify-content: space-between;
`;
