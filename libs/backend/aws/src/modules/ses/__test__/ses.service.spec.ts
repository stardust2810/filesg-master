/* eslint-disable sonarjs/no-duplicate-string */
import 'aws-sdk-client-mock-jest';

import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';

import { SES_CLIENT } from '../../../typings/ses.typing';
import { mockEmailContent, mockEmailTitle, mockReceivers, mockSender } from '../__mocks__/ses.service.mock';
import { SesService } from '../ses.service';

describe('SesService', () => {
  let service: SesService;
  const mockBaseSesClient = mockClient(SESv2Client);

  // Return MessageId to prevent missing property error
  mockBaseSesClient.on(SendEmailCommand).resolves({ MessageId: 'mockMessageId' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SesService,
        {
          provide: SES_CLIENT,
          useValue: mockBaseSesClient,
        },
      ],
    }).compile();

    service = module.get<SesService>(SesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should be defined', () => {
      expect(service.sendEmail).toBeDefined();
    });

    it('should send SendEmailCommand with correct args', async () => {
      await service.sendEmail(mockSender, mockReceivers(2), mockEmailTitle, mockEmailContent);

      expect(mockBaseSesClient).toReceiveCommandWith(SendEmailCommand, {
        Content: {
          Simple: {
            Subject: {
              Data: mockEmailTitle,
            },
            Body: {
              Html: {
                Data: mockEmailContent,
              },
            },
          },
        },
        FromEmailAddress: mockSender,
        Destination: {
          ToAddresses: mockReceivers(2),
        },
      });
    });
  });
});
