import { EmailBlackList, EmailBlackListCreationModel } from '../../../../entities/email-black-list';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockBlackListedEmail = (args: TestCreationModel<EmailBlackListCreationModel>) => {
  const email = new EmailBlackList();

  email.emailAddress = args.emailAddress;

  return email;
};
