import { MockRepository } from '../../../../typings/common.mock';
import { EserviceWhitelistedUserEntityRepository } from '../eservice-whitelisted-user.entity.respository';

export const mockEserviceWhitelistedUserEntityRepository: MockRepository<EserviceWhitelistedUserEntityRepository> = {
  getRepository: jest.fn(),
  findEserviceWhitelistedUsersByAgencyCodeAndEserviceNameAndEmails: jest.fn(),
  updateEserviceWhitelistedUsersByEmails: jest.fn(),
};
