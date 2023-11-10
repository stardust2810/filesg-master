import { Test, TestingModule } from '@nestjs/testing';

import { mockEmailBlackListEntityService } from '../../../entities/email-black-list/__mocks__/email-black-list.entity.service.mock';
import { EmailBlackListEntityService } from '../../../entities/email-black-list/email-black-list.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockOldBlackListedEmail, mockRecentBlackListedEmail } from '../__mocks__/email-black-list.service.mock';
import { EmailBlackListService } from '../email-black-list.service';

describe('EmailBlackListService', () => {
  let service: EmailBlackListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailBlackListService,
        { provide: EmailBlackListEntityService, useValue: mockEmailBlackListEntityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    service = module.get<EmailBlackListService>(EmailBlackListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isEmailBlackListed', () => {
    it('should return true indicating the email is black listed', async () => {
      mockEmailBlackListEntityService.retrieveBlackListedEmail.mockResolvedValueOnce(mockRecentBlackListedEmail);

      expect(await service.isEmailBlackListed('bounce@simulator.amazonses.com')).toBe(true);
    });

    it('should return false indicating the email is not black listed', async () => {
      mockEmailBlackListEntityService.retrieveBlackListedEmail.mockResolvedValueOnce(null);

      expect(await service.isEmailBlackListed('valid@email.com')).toBe(false);
    });

    it('should return false indicating the email was black listed long ago', async () => {
      mockEmailBlackListEntityService.retrieveBlackListedEmail.mockResolvedValueOnce(mockOldBlackListedEmail);

      expect(await service.isEmailBlackListed('bounce-old@simulator.amazonses.com')).toBe(false);
    });
  });
});
