import { Application, ApplicationCreationModel } from '../../../../entities/application';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockApplication = (args: TestCreationModel<ApplicationCreationModel>) => {
  const application = new Application();

  args.id && (application.id = args.id);
  args.uuid && (application.uuid = args.uuid);
  args.externalRefId && (application.externalRefId = args.externalRefId);
  application.transactions = args.transactions;
  application.eservice = args.eservice;
  application.applicationType = args.applicationType;

  return application;
};
