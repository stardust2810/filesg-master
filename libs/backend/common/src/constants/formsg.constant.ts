export enum EVENT_LOGGING_EVENTS {
  FORMSG_PROCESS_INIT = 'formsg-process-init',
  FORMSG_PROCESS_SUCCESS = 'formsg-process-success',
  FORMSG_PROCESS_FAILURE = 'formsg-process-failure',
  FORMSG_TRANSACTION_SUCCESS = 'formsg-transaction-success',
  FORMSG_TRANSACTION_FAILURE = 'formsg-transaction-failure',
  FORMSG_BATCH_PROCESS_UPDATE = 'formsg-batch-process-update',
  FORMSG_BATCH_PROCESS_COMPLETE = 'formsg-batch-process-complete',
  FORMSG_BATCH_PROCESS_TRANSACTION_SUCCESS = 'formsg-batch-process-transaction-success',
  FORMSG_BATCH_PROCESS_TRANSACTION_FAILURE = 'formsg-batch-process-transaction-failure',
  FORMSG_BATCH_PROCESS_FAILURE = 'formsg-batch-process-failure',
  FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS = 'formsg-recipient-notification-delivery-success',
  FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE = 'formsg-recipient-notification-delivery-failure',
}

export enum RESULT_STATUS {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export enum FORMSG_PROCESS_FAIL_TYPE {
  AUTH_DECRYPT = 'formsg-process-auth-decrypt',
  CREATE_TXN = 'formsg-process-create-txn',
  FILE_UPLOAD = 'formsg-process-file-upload',
  BATCH_VALIDATION = 'formsg-batch-validation',
  OTHERS = 'formsg-process-others',
  BATCH_OTHERS = 'formsg-batch-process-others',
}

export enum FORMSG_TRANSACTION_FAIL_TYPE {
  VIRUS_SCAN = 'formsg-transaction-virus-scan',
  OTHERS = 'formsg-transaction-others',
}
