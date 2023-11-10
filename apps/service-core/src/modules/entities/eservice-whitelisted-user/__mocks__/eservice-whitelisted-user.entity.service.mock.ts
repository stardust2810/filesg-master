import { STATUS } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { EserviceWhitelistedUserEntityService } from '../eservice-whitelisted-user.entity.service';
import { createMockEserviceWhitelistedUser } from './eservice-whitelisted-user.mock';

export const mockEserviceWhitelistedUserEntityService: MockService<EserviceWhitelistedUserEntityService> = {
  buildEserviceWhitelistedUser: jest.fn(),
  insertEserviceWhitelistedUsers: jest.fn(),
  retrieveEserviceWhitelistedUsersByAgencyCodeAndEserviceNameAndEmails: jest.fn(),
  updateEserviceWhitelistedUsersByEmails: jest.fn(),
};

export const mockEserviceWhitelistedUser = createMockEserviceWhitelistedUser({
  email: 'john@tech.gov.sg',
  status: STATUS.ACTIVE,
});
