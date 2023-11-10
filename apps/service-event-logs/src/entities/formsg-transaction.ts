import { FORMSG_PROCESS_FAIL_TYPE, FORMSG_TRANSACTION_FAIL_TYPE, RESULT_STATUS } from '@filesg/backend-common';
import { NOTIFICATION_CHANNEL } from '@filesg/common';
import * as dynamoose from 'dynamoose';

import { generateSchemaTimestampConfig } from '../utils/common';

export const FORMSG_TRANSACTION = 'FORMSG_TRANSACTION';

export class FormSgTransactionKey {
  id: string;
}

export interface Process {
  timestamp: string;
  result: RESULT_STATUS;
  failedReason?: string;
}

export interface Application {
  type: string;
  externalRefId?: string;
}

export interface RecipientActivity {
  uuid?: string;
  name: string;
  maskedUin: string;
  email?: string;
  dob?: string;
  contact?: string;
  isNonSingpassRetrievable?: boolean;
  failSubType?: string;
  failedReason?: string;
}

export interface AgencyFileAsset {
  uuid?: string;
  name: string;
  deleteAt?: string;
  failSubType?: string;
  failedReason?: string;
}

export interface Transaction {
  uuid?: string;
  name: string;
  recipientActivities: RecipientActivity[];
  agencyFileAssets: AgencyFileAsset[];
}

export interface NotificationBase {
  status: RESULT_STATUS;
  maskedUin: string;
  recipientActivityUuid: string;
  failSubType?: string;
  failedReason?: string;
}

export interface EmailNotificationInfo extends NotificationBase {
  channel: NOTIFICATION_CHANNEL.EMAIL;
  email: string;
}

export interface SgNotifyNotificationInfo extends NotificationBase {
  channel: NOTIFICATION_CHANNEL.SG_NOTIFY;
}

export class FormSgTransaction extends FormSgTransactionKey {
  queueEventTimestamp: string;
  processorStartedTimestamp: string;
  processorEndedTimestamp?: string;
  processes?: Process[];
  requestorEmail?: string;
  application?: Application;
  transaction?: Transaction;
  transactionUuid?: string;
  result?: RESULT_STATUS;
  failType?: FORMSG_PROCESS_FAIL_TYPE | FORMSG_TRANSACTION_FAIL_TYPE;
  failSubType?: string;
  failedReason?: string;
  batchId?: string;
  notificationsSent?: (EmailNotificationInfo | SgNotifyNotificationInfo)[];
  notificationsToSendCount?: number;

  // for batch header
  failedNotificationCount?: number;
  batchSize?: number;
  processedTransactionCount?: number;
  failedTransactionCount?: number;
}

export type FormSgTransactionCreationModel = FormSgTransaction;
export type FormSgTransactionUpdateModel = Partial<Omit<FormSgTransaction, keyof FormSgTransactionKey>>;

export const FormSgTransactionSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      required: true,
      hashKey: true,
    },
    queueEventTimestamp: {
      type: String,
      required: true,
    },
    processorStartedTimestamp: {
      type: String,
      required: true,
    },
    processorEndedTimestamp: String,
    processes: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            timestamp: {
              type: String,
              required: true,
            },
            result: {
              type: String,
              enum: Object.values(RESULT_STATUS),
              required: true,
            },
            failedReason: String,
          },
        },
      ],
    },
    requestorEmail: String,
    application: {
      type: Object,
      schema: {
        type: {
          type: String,
          required: true,
        },
        externalRefId: String,
      },
    },
    transaction: {
      type: Object,
      schema: {
        uuid: String,
        name: {
          type: String,
          required: true,
        },
        recipientActivities: {
          type: Array,
          required: true,
          schema: [
            {
              type: Object,
              schema: {
                uuid: String,
                name: {
                  type: String,
                  required: true,
                },
                maskedUin: {
                  type: String,
                  required: true,
                },
                email: String,
                dob: String,
                contact: String,
                isNonSingpassRetrievable: Boolean,
                failSubType: String,
                failedReason: String,
              },
            },
          ],
        },
        agencyFileAssets: {
          type: Array,
          required: true,
          schema: [
            {
              type: Object,
              schema: {
                name: {
                  type: String,
                  required: true,
                },
                uuid: String,
                deleteAt: String,
                failSubType: String,
                failedReason: String,
              },
            },
          ],
        },
      },
    },
    transactionUuid: {
      type: String,
      index: {
        type: 'global',
        name: 'transactionUuid-index',
      },
    },
    result: {
      type: String,
      enum: Object.values(RESULT_STATUS),
    },
    failType: {
      type: String,
      enum: [...Object.values(FORMSG_PROCESS_FAIL_TYPE), ...Object.values(FORMSG_TRANSACTION_FAIL_TYPE)],
    },
    failSubType: String,
    failedReason: String,
    batchId: {
      type: String,
      index: {
        type: 'global',
        name: 'batchId-index',
      },
    },
    notificationsSent: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            recipientActivityUuid: {
              type: String,
              required: true,
            },
            channel: {
              type: String,
              enum: Object.values(NOTIFICATION_CHANNEL),
              required: true,
            },
            status: {
              type: String,
              enum: Object.values(RESULT_STATUS),
              required: true,
            },
            maskedUin: {
              type: String,
              required: true,
            },
            email: String,
            failSubType: String,
            failedReason: String,
          },
        },
      ],
    },
    notificationsToSendCount: Number,
    failedNotificationCount: Number,
    batchSize: Number,
    processedTransactionCount: Number,
    failedTransactionCount: Number,
  },
  {
    timestamps: generateSchemaTimestampConfig(),
  },
);
