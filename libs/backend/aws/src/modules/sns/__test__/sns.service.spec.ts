/* eslint-disable sonarjs/no-duplicate-string */
import { SNSClient } from '@aws-sdk/client-sns';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';

import { SNS_CLIENT } from '../../../typings/sns.typing';
import { SnsService } from '../sns.service';

describe('SnsService', () => {
  let service: SnsService;
  const mockBaseSnsClient = mockClient(SNSClient);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnsService,
        {
          provide: SNS_CLIENT,
          useValue: mockBaseSnsClient,
        },
      ],
    }).compile();

    service = module.get<SnsService>(SnsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should be defined', () => {
      expect(service.sendSms).toBeDefined();
    });
  });
});
