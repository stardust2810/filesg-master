import { Email, EmailCreationModel } from '../../../../entities/email';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockEmail = (args: TestCreationModel<EmailCreationModel>) => {
  const email = new Email();

  args.id && (email.id = args.id);
  email.awsMessageId = args.awsMessageId;
  email.activity = args.activity;
  email.emailId = args.emailId;
  args.eventType && (email.eventType = args.eventType);
  args.subEventType && (email.subEventType = args.subEventType);
  email.type = args.type;

  return email;
};
