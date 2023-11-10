import { Eservice, EserviceCreationModel } from '../../../../entities/eservice';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockEservice = (args: TestCreationModel<EserviceCreationModel>) => {
  const eservice = new Eservice();

  args.id && (eservice.id = args.id);
  args.uuid && (eservice.uuid = args.uuid);
  eservice.name = args.name;
  eservice.emails = args.emails;
  eservice.agency = args.agency;
  args.agencyId && (eservice.agencyId = args.agencyId);
  eservice.applications = args.applications;
  eservice.users = args.users;
  eservice.applicationTypes = args.applicationTypes;
  eservice.acknowledgementTemplates = args.acknowledgementTemplates;

  return eservice;
};
