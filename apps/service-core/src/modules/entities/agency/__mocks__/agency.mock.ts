import { STATUS } from '@filesg/common';

import { Agency, AgencyCreationModel } from '../../../../entities/agency';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockAgency = (args: TestCreationModel<AgencyCreationModel>) => {
  const agency = new Agency();

  args.id && (agency.id = args.id);
  args.uuid && (agency.uuid = args.uuid);
  agency.name = args.name;
  agency.status = STATUS.ACTIVE;
  agency.code = args.code;
  agency.eservices = args.eservices;
  agency.transactionCustomMessageTemplates = args.transactionCustomMessageTemplates;
  agency.notificationMessageTemplates = args.notificationMessageTemplates;

  return agency;
};
