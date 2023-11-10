import { EserviceWhitelistedUser, EserviceWhitelistedUserCreationModel } from '../../../../entities/eservice-whitelisted-user';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockEserviceWhitelistedUser = (args: TestCreationModel<EserviceWhitelistedUserCreationModel>) => {
  const eserviceWhitelistedUser = new EserviceWhitelistedUser();

  args.id && (eserviceWhitelistedUser.id = args.id);
  eserviceWhitelistedUser.email = args.email;
  eserviceWhitelistedUser.eserviceUser = args.eserviceUser;
  eserviceWhitelistedUser.status = args.status;
  eserviceWhitelistedUser.transactions = args.transactions

  return eserviceWhitelistedUser;
};
