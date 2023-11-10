import { Modal } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledModal = styled(Modal)`
  align-items: baseline;
  padding-top: ${({ theme }) => theme.FSG_SPACING.S40};

  @media screen and (max-width: ${({ theme }) => theme.FSG_BREAKPOINTS.MOBILE}) {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledCard = styled(Modal.Card)`
  width: 448px;
  max-height: calc(90vh - (2 * ${({ theme }) => theme.FSG_SPACING.S40}));

  @media screen and (max-width: ${({ theme }) => theme.FSG_BREAKPOINTS.MOBILE}) {
    max-height: calc(90vh - (2 * ${({ theme }) => theme.FSG_SPACING.S16}));
  }
`;

export const StyledBody = styled(Modal.Body)`
  padding: 0;
  row-gap: 0;
`;

export const StyledBodyTextContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledFooter = styled(Modal.Footer)`
  justify-content: flex-end;
`;
