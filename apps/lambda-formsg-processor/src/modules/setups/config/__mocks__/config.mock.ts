import { FEATURE_TOGGLE } from '@filesg/common';

import { FORM_ID } from '../../../../const/formsg-question-field-map';
import { FileSGConfigService } from '../config.service';

export const mockFileSGConfigService = {
  systemConfig: {
    env: 'mockEnv',
    useLocalstack: FEATURE_TOGGLE.OFF,
    coreServiceUrl: 'http://localhost:1081',
    transferServiceUrl: 'http://localhost:1082',
    eventLogsServiceUrl: 'http://localhost:1083',
  },
  awsConfig: {
    region: 'mockRegion',
  },
  authConfig: {
    fileSgSystemIntegrationClientId: 'mock-clientId',
  },
  formSGConfig: {
    formSgSingleIssuanceFormId: FORM_ID.SINGLE_ISSUANCE_DEV,
    formSgSingleIssuanceWebhookUrl: 'mock-single-issuance-webhook-url',
    formSgBatchIssuanceFormId: FORM_ID.BATCH_ISSUANCE_DEV,
    formSgBatchIssuanceWebhookUrl: 'mock-batch-issuance-webhook-url',
    formSgRecallTransactionFormId: FORM_ID.RECALL_TRANSACTION_DEV,
    formSgRecallTransactionWebhookUrl: 'mock-recall-transaction-webhook-url',
  },
} as unknown as FileSGConfigService;
