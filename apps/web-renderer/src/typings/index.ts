import { AgencyOaDocument, FileQrCodeResponse, VerificationResult } from '@filesg/common';

export type StyleProps = {
  style?: React.CSSProperties;
  className?: string;
};

// =============================================================================
// ICA
// =============================================================================

export interface LtpPass extends AgencyOaDocument {
  verificationResult?: VerificationResult;
  verificationDate?: string;
  qrCodeDetails?: FileQrCodeResponse;
  showQr?: boolean;
  showFullDetails?: boolean;
}
