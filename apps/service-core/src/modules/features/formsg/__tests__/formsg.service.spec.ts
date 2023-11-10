import { InputValidationException } from '@filesg/backend-common';
import { NOTIFICATION_CHANNEL } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  mockApplicationTypeEntityService,
  mockApplicationTypeWithNotificationChannels,
} from '../../../entities/application-type/__mocks__/application-type.entity.service.mock';
import { ApplicationTypeEntityService } from '../../../entities/application-type/application-type.entity.service';
import { mockEserviceUser, mockEserviceUserEntityService } from '../../../entities/user/__mocks__/eservice-user.entity.service.mock';
import { EserviceUserEntityService } from '../../../entities/user/eservice-user.entity.service';
import { FormSgService } from '../formsg.service';

describe('FormsgTransactionService', () => {
  let service: FormSgService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormSgService,
        { provide: EserviceUserEntityService, useValue: mockEserviceUserEntityService },
        { provide: ApplicationTypeEntityService, useValue: mockApplicationTypeEntityService },
      ],
    }).compile();

    service = module.get<FormSgService>(FormSgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Verify Requestor Email', () => {
    it('should return eservice user if requestor email is whitelisted', async () => {
      mockEserviceUserEntityService.retrieveEserviceUserByActiveWhitelistEmail.mockResolvedValueOnce(mockEserviceUser);

      expect(await service.verifyRequestorEmail('test@test.email')).toEqual(mockEserviceUser);
    });

    it('should throw InputValidationException if eservice user email is not whitelisted', async () => {
      mockEserviceUserEntityService.retrieveEserviceUserByActiveWhitelistEmail.mockResolvedValueOnce(null);

      await expect(service.verifyRequestorEmail('test@test.email')).rejects.toThrow(InputValidationException);
    });
  });
});
