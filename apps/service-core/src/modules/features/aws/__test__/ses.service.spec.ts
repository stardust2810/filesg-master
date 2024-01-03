import { SesService as BaseSesService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import {
  mockAgencyCode,
  mockBaseSesService,
  mockEmailAttachments,
  mockEmailContent,
  mockEmailReceivers,
  mockEmailTitle,
} from '../__mocks__/ses.service.mock';
import { SesService } from '../ses.service';

describe('SesService', () => {
  let service: SesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SesService,
        {
          provide: BaseSesService,
          useValue: mockBaseSesService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
      ],
    }).compile();

    service = module.get<SesService>(SesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmailFromFileSG', () => {
    it('should be defined', () => {
      expect(service.sendEmailFromFileSG).toBeDefined();
    });

    it('should call baseSesService sendEmail with correct args when no attachments are provided', async () => {
      const mockSender = mockFileSGConfigService.notificationConfig.senderAddress;

      await service.sendEmailFromFileSG(mockEmailReceivers, mockEmailTitle, mockEmailContent);

      expect(mockBaseSesService.sendEmail).toBeCalledWith(
        `FileSG <${mockSender}>`,
        mockEmailReceivers,
        mockEmailTitle,
        mockEmailContent,
        undefined,
      );
    });

    it('should call baseSesService sendEmailwithAttachments with correct args when attachments are provided', async () => {
      const mockSender = mockFileSGConfigService.notificationConfig.senderAddress;

      await service.sendEmailFromFileSG(mockEmailReceivers, mockEmailTitle, mockEmailContent, undefined, mockEmailAttachments);

      expect(mockBaseSesService.sendEmail).toBeCalledWith(
        `FileSG <${mockSender}>`,
        mockEmailReceivers,
        mockEmailTitle,
        mockEmailContent,
        mockEmailAttachments,
      );
    });

    it('should call baseSesService sendEmail with correct email title when agency code is provided', async () => {
      const mockSender = mockFileSGConfigService.notificationConfig.senderAddress;

      await service.sendEmailFromFileSG(mockEmailReceivers, mockEmailTitle, mockEmailContent, mockAgencyCode);

      expect(mockBaseSesService.sendEmail).toBeCalledWith(
        `${mockAgencyCode} (via FileSG) <${mockSender}>`,
        mockEmailReceivers,
        mockEmailTitle,
        mockEmailContent,
        undefined,
      );
    });
  });
});
