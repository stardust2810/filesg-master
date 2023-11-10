import { Transaction, TransactionCreationModel } from '../../../../entities/transaction';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockTransaction = (args: TestCreationModel<TransactionCreationModel>) => {
  const transaction = new Transaction();

  args.id && (transaction.id = args.id);
  args.uuid && (transaction.uuid = args.uuid);
  args.fileSessionId && (transaction.fileSessionId = args.fileSessionId);
  transaction.name = args.name;
  transaction.status = args.status;
  transaction.type = args.type;
  transaction.creationMethod = args.creationMethod;
  args.customAgencyMessage && (transaction.customAgencyMessage = args.customAgencyMessage);
  transaction.activities = args.activities;
  transaction.application = args.application;
  transaction.user = args.user;
  args.userId && (transaction.userId = args.userId);
  args.applicationId && (transaction.applicationId = args.applicationId);

  return transaction;
};
