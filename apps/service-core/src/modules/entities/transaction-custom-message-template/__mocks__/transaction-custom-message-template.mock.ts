import {
  TransactionCustomMessageTemplate,
  TransactionCustomMessageTemplateCreationModel,
} from '../../../../entities/transaction-custom-message-template';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockTransactionCustomMessageTemplate = (args: TestCreationModel<TransactionCustomMessageTemplateCreationModel>) => {
  const transactionCustomMessageTemplate = new TransactionCustomMessageTemplate();

  args.id && (transactionCustomMessageTemplate.id = args.id);
  args.uuid && (transactionCustomMessageTemplate.uuid = args.uuid);
  transactionCustomMessageTemplate.name = args.name;
  transactionCustomMessageTemplate.template = args.template;
  transactionCustomMessageTemplate.agency = args.agency;
  transactionCustomMessageTemplate.requiredFields = args.requiredFields ?? null;
  transactionCustomMessageTemplate.type = args.type;

  return transactionCustomMessageTemplate;
};
