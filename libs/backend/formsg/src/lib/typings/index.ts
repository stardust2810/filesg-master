export declare type FieldType =
  | 'section'
  | 'radiobutton'
  | 'dropdown'
  | 'checkbox'
  | 'nric'
  | 'email'
  | 'table'
  | 'number'
  | 'rating'
  | 'yes_no'
  | 'decimal'
  | 'textfield'
  | 'textarea'
  | 'attachment'
  | 'date'
  | 'mobile'
  | 'homeno';

export declare type FormField = {
  _id: string;
  question: string;
  fieldType: FieldType;
  isHeader?: boolean;
  signature?: string;
} & (
  | {
      answer: string;
      answerArray?: never;
    }
  | {
      answer?: never;
      answerArray: string[] | string[][];
    }
);

export declare type EncryptedContent = string;
export declare type EncryptedAttachmentRecords = Record<string, string>;

export type DecryptParams = {
  encryptedContent: EncryptedContent;
  version: number;
  verifiedContent?: EncryptedContent;
  attachmentDownloadUrls?: EncryptedAttachmentRecords;
};
export type FileSgEncryptedFormData = {
  formId: string;
  submissionId: string;
} & DecryptParams;

export declare type DecryptedContent = {
  responses: FormField[];
  verified?: Record<string, any>;
};
