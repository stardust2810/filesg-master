import { booleanTransformer, Metadata, stringToObjectTransformer, transformToUndefinedIfEmpty } from '@filesg/common';
import { FileSgEncryptedFormData } from '@filesg/formsg';
import { SQSRecord } from 'aws-lambda';
import { Transform, Type } from 'class-transformer';

import { BATCH_ISSUANCE_FORM_FIELD, RECALL_TRANSACTION_FORM_FIELD, SINGLE_ISSUANCE_FORM_FIELD } from '../const/formsg-question-field-map';
import {
  formSgBatchIssuanceFileNamesTransformer,
  formSgDateTransformer,
  formSgTextAreaTransformer,
  formSgYesNoBooleanTransformer,
  removeEmptyObjectTransformer,
} from '../utils/transformers';

// =============================================================================
// Transformer Schema
// =============================================================================
export class SingleIssuanceTransactionRecord {
  public name: string;

  @Transform(formSgTextAreaTransformer)
  public longCustomMessage: string[];

  // FIXME: No support for sg-notify on formsg issuance
  // @Transform(formSgTextAreaTransformer)
  // public shortCustomMessage?: string[];

  // FIXME: No support for sg-notify on formsg issuance
  // @Transform(transformToUndefinedIfEmpty)
  // @Transform(formSgYesNoBooleanTransformer)
  // public isAcknowledgementRequired?: boolean;

  @Type(() => IssuanceRecipientRecord)
  @Transform(removeEmptyObjectTransformer)
  recipients: IssuanceRecipientRecord[];
}

export class SingleIssuanceApplicationRecord {
  @Transform(transformToUndefinedIfEmpty)
  public externalRefId?: string;

  @Transform(transformToUndefinedIfEmpty)
  public type: string;
}

export class IssuanceRecipientRecord {
  @Transform(transformToUndefinedIfEmpty)
  public uin: string;

  @Transform(transformToUndefinedIfEmpty)
  public name: string;

  @Transform(transformToUndefinedIfEmpty)
  public email: string;

  @Transform(formSgDateTransformer)
  public dob?: string;

  @Transform(transformToUndefinedIfEmpty)
  public contact?: string;

  @Transform(formSgYesNoBooleanTransformer)
  public isNonSingpassRetrievable?: boolean;
}

export class IssuanceFileRecord {
  @Transform(transformToUndefinedIfEmpty)
  public name: string;

  @Transform(transformToUndefinedIfEmpty)
  public checksum: string;

  @Transform(formSgDateTransformer)
  public deleteAt?: string;

  // FIXME: No support for sg-notify on formsg issuance
  // @Transform(formSgYesNoBooleanTransformer)
  // public isPasswordEncryptionRequired?: boolean;
}

export class SingleIssuanceFormData {
  @Type(() => SingleIssuanceTransactionRecord)
  transaction: SingleIssuanceTransactionRecord;

  @Type(() => SingleIssuanceApplicationRecord)
  application: SingleIssuanceApplicationRecord;

  @Type(() => IssuanceFileRecord)
  @Transform(removeEmptyObjectTransformer)
  files: IssuanceFileRecord[];

  requestorEmail: string;
}

export class RecallTransactionFormData {
  requestorEmail: string;
  transactionUuid: string;
}

// No validation, as validation will be handled by createFormSgFileTransaction
export class BatchIssuanceSidecarData {
  uin: string;
  name: string;
  email: string;
  dob?: string;
  contact?: string;

  @Transform(stringToObjectTransformer)
  metadata?: Metadata;

  @Transform(formSgBatchIssuanceFileNamesTransformer)
  files: string[];

  externalRefId?: string;
  deleteAt?: string;

  @Transform(booleanTransformer('extended'))
  isNonSingpassRetrievable?: boolean;
}
// =============================================================================
// Typings
// =============================================================================
export interface FormSgSqsRecord extends SQSRecord {
  parsedBodyData?: FileSgEncryptedFormData;
  parsedMessageAttributes?: FormSgMessageAttributes;
}

export interface FormSgMessageAttributes {
  type?: string;
  formsgSignature?: string;
}

export type FormSgFormField = SINGLE_ISSUANCE_FORM_FIELD | BATCH_ISSUANCE_FORM_FIELD | RECALL_TRANSACTION_FORM_FIELD;
export type QuestionFieldMap = Record<string, Record<string, string>>;

// Batch issuance
export interface BatchIssuanceFileUploadRequestData {
  fileNames: string[];
}

export interface BatchIssuanceSingleTransactionData {
  id: string;
  createFileTransactionRequestData: SingleIssuanceFormData;
  fileUploadRequestData: BatchIssuanceFileUploadRequestData;
}

export class PreParsedCreateTransactionRequestSingleIssuanceTransactionRecord {
  name: string;
  longCustomMessage: string;
  recipients: IssuanceRecipientRecord[];
}

export interface PreParsedCreateTransactionRequestData {
  transaction: PreParsedCreateTransactionRequestSingleIssuanceTransactionRecord;
  application: SingleIssuanceApplicationRecord;
  files: IssuanceFileRecord[];
  requestorEmail: string;
}
