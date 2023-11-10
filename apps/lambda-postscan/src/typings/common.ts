// =============================================================================
// Typing
// =============================================================================
export interface LambdaSnsEvent {
  Records: LambdaSnsRecord[];
}

interface LambdaSnsRecord {
  EventVersion: string;
  EventSubscriptionArn: string;
  EventSource: string;
  Sns: {
    SignatureVersion: string;
    Timestamp: string;
    Signature: string;
    SigningCertUrl: string;
    MessageId: string;
    Message: string;
    MessageAttributes: {
      Test: {
        Type: string;
        Value: string;
      };
      TestBinary: {
        Type: string;
        Value: string;
      };
    };
    Type: string;
    UnsubscribeUrl: string;
    TopicArn: string;
    Subject: string;
  };
}

export type ScanResultSnsMessage = ScanResultSuccessSnsMessage | ScanResultFailureSnsMessage;

interface ScanResultBaseMessage {
  timestamp: number;
  sqs_message_id: string;
  xamz_request_id: string;
  file_url: string;
  scanner_status_message: string;
}

interface ScanResultSuccessSnsMessage extends ScanResultBaseMessage {
  scanner_status: 0;
  scanning_result: {
    TotalBytesOfFile: number;
    Findings: ScanResultFindings[];
    Error: string;
    Codes: number[];
  };
}

interface ScanResultFailureSnsMessage extends ScanResultBaseMessage {
  scanner_status: -1 | -2 | -3 | -4;
  scanning_result: {
    Error: string;
  };
}

interface ScanResultFindings {
  malware: string;
  type: string;
}

// =============================================================================
// Constants
// =============================================================================
// Trend Micro Cloud One FSS
export const CODE_SKIP_MULTIPLE = 100;
export const CODE_MISC = 199;
export const FSS_TAG_PREFIX = 'fss-';

// =============================================================================
// Enums
// =============================================================================
export enum SCAN_RESULT_MESSAGE {
  'incomplete scan due to multiple reasons' = 100,
  'incomplete archive file extraction due to file too large',
  'incomplete archive file extraction due to too many files in archive',
  'incomplete archive file extraction due to too many archive layers',
  'incomplete archive file extraction due to compression ratio exceeds limit',
  'incomplete archive file extraction due to unsupported compression method',
  'incomplete archive file extraction due to corrupted compression file',
  'incomplete archive file extraction due to archive file encryption',
  'incomplete scan due to Microsoft Office file encryption',
  'incomplete scan due to miscellaneous reason. Provide the fss-scan-detail-code tag value to Trend Micro support' = 199,
}

export enum SCAN_RESULT_TAG {
  NO_ISSUES_FOUND = 'no issues found',
  MALICIOUS = 'malicious',
}
