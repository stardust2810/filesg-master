import { Modal } from '@filesg/design-system';
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
  row-gap: 0;

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
