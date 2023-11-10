import { ApplicationType, ApplicationTypeCreationModel } from '../../../../entities/application-type';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockApplicationType = (args: TestCreationModel<ApplicationTypeCreationModel>) => {
  const applicationType = new ApplicationType();

  args.id && (applicationType.id = args.id);
  args.uuid && (applicationType.uuid = args.uuid);
  applicationType.code = args.code;
  applicationType.name = args.name;
  applicationType.applications = args.applications;
  applicationType.eservice = args.eservice;

  return applicationType;
};
