import styled from 'styled-components';

import { ICA_FULL_PASS_WIDTH, ICA_FULL_TEMPLATE_WIDTH, ICA_MOBILE_TEMPLATE_WIDTH, ICA_VERIFY_PASS_WIDTH } from '../../../../const';
import { Barcode } from '../../components/barcode';

export const TemplateContainer = styled.div<{ $showQr: boolean; showFullDetails: boolean }>`
  display: flex;
  justify-content: center;

  background-color: #f7f7f7;

  overflow: hidden;

  margin: 2rem auto;
  max-width: ${({ $showQr }) => ($showQr ? ICA_FULL_TEMPLATE_WIDTH : ICA_VERIFY_PASS_WIDTH)};

  // For background color to show during printing
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact; // Chrome, Opera support

  @media print {
    @page {
      size: A4; // A4 print size
      margin: 0;
    }

    max-width: none;
    width: fit-content;
    margin: 0;
  }

  @media screen and (max-width: 599px) {
    flex-direction: column;

    max-width: ${({ $showQr }) => ($showQr ? ICA_MOBILE_TEMPLATE_WIDTH : ICA_VERIFY_PASS_WIDTH)};

    margin: ${({ theme, showFullDetails }) => (showFullDetails ? 'auto' : `${theme.FSG_SPACING.S32} auto`)};
  }

  @media screen and (max-width: 360px) {
    margin: ${({ theme, showFullDetails }) => (showFullDetails ? 'auto' : `${theme.FSG_SPACING.S32} auto 0 auto`)};
  }
`;

export const PassContainer = styled.div`
  display: flex;
  flex: 1;

  justify-content: center;
  box-sizing: border-box;

  width: fit-content;

  padding: 1rem;
  gap: 1rem;

  @media screen and (max-width: 599px) {
    flex-direction: column;
  }

  @media print {
    padding: 0.75rem;
  }
`;

export const BarcodeCardContainer = styled.div`
  display: flex;

  flex-direction: column;
  align-items: flex-start;

  background-color: #ffffff;

  width: ${ICA_FULL_PASS_WIDTH};
  border-radius: 1rem;
`;

export const StyledBarcode = styled(Barcode)`
  width: 100%;
  height: auto;
`;

export const StyledImage = styled.img`
  height: 100%;
  width: 100%;

  max-width: ${ICA_FULL_PASS_WIDTH};
  border-radius: 1rem;

  @media print {
    width: 85.5mm;
    max-width: 85.5mm;
  }
`;
