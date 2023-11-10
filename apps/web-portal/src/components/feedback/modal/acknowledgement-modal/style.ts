import { Checkbox, Modal } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledModalHeader = styled(Modal.Header)`
  row-gap: 0;

  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S16 + ' ' + S24;
  }};

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => {
      const { S12, S16 } = theme.FSG_SPACING;
      return S12 + ' ' + S16;
    }};
  }
`;

export const StyledModalBody = styled(Modal.Body)`
  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S16 + ' ' + S24;
  }};

  @media screen and (max-width: 599px) {
    padding: ${({ theme }) => {
      const { S16 } = theme.FSG_SPACING;
      return S16;
    }};
  }
`;

export const StyledModalFooter = styled(Modal.Footer)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const StyledCheckbox = styled(Checkbox)`
  padding: ${({ theme }) => theme.FSG_SPACING.S16} 0;
`;

export const StyledFooterButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  > button:not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;
