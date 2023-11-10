import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailBlackList } from '../../../../entities/email-black-list';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockEmailBlackListEntityRepository } from '../__mocks__/email-black-list.entity.repository.mock';
import { mockBlackListedEmail } from '../__mocks__/email-black-list.entity.service.mock';
import { EmailBlackListEntityRepository } from '../email-black-list.entity.repository';
import { EmailBlackListEntityService } from '../email-black-list.entity.service';

describe('EmailBlackListEntityService', () => {
  let service: EmailBlackListEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailBlackListEntityService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: EmailBlackListEntityRepository, useValue: mockEmailBlackListEntityRepository },
      ],
    }).compile();

    service = module.get<EmailBlackListEntityService>(EmailBlackListEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('upsertByEmail', () => {
    it(`should call repository's upsertByEmail function with right param`, async () => {
      const email = 'email@gmail.com';
      await service.upsertByEmail(email);
      expect(mockEmailBlackListEntityRepository.upsertByEmail).toBeCalledWith(email, undefined);
    });
  });

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  describe('retrieveBlackListedEmail', () => {
    const { emailAddress } = mockBlackListedEmail;

    it('should return black listed email when found', async () => {
      mockEmailBlackListEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockBlackListedEmail);

      expect(await service.retrieveBlackListedEmail(emailAddress)).toEqual(mockBlackListedEmail);
      expect(mockEmailBlackListEntityRepository.getRepository().findOne).toBeCalledWith({ where: { emailAddress } });
    });

    it('should throw EntityNotFoundException when toThrow set to true and black listed email is not found', async () => {
      mockEmailBlackListEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveBlackListedEmail(emailAddress, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.EMAIL_BLACK_LIST_SERVICE, EmailBlackList.name, 'emailAddress', `${emailAddress}`),
      );
      expect(mockEmailBlackListEntityRepository.getRepository().findOne).toBeCalledWith({ where: { emailAddress } });
    });

    it('should return null when toThrow set to false and black listed email is not found', async () => {
      mockEmailBlackListEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(await service.retrieveBlackListedEmail(emailAddress, { toThrow: false })).toEqual(null);
      expect(mockEmailBlackListEntityRepository.getRepository().findOne).toBeCalledWith({ where: { emailAddress } });
    });
  });

  // ===========================================================================
  // Delete
  // ===========================================================================
  describe('deleteBlackListedEmail', () => {
    it(`should call repository getRepository's delete function with right param`, async () => {
      const email = 'email@gmail.com';
      await service.deleteBlackListedEmail(email);
      expect(mockEmailBlackListEntityRepository.getRepository().delete).toBeCalledWith({ emailAddress: email });
    });
  });
});
