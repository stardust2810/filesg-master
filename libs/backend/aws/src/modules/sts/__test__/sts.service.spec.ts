/* eslint-disable sonarjs/no-duplicate-string */
import 'aws-sdk-client-mock-jest';

import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';

import { STS_CLIENT } from '../../../typings/sts.typing';
import { mockCredentials, mockDurationSeconds, mockRoleArn, mockRoleSessionName, mockTags } from '../__mocks__/sts.service.mock';
import { StsService } from '../sts.service';

describe('StsService', () => {
  let service: StsService;
  const mockBaseStsClient = mockClient(STSClient);

  mockBaseStsClient.on(AssumeRoleCommand).resolves({ Credentials: mockCredentials });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StsService,
        {
          provide: STS_CLIENT,
          useValue: mockBaseStsClient,
        },
      ],
    }).compile();

    service = module.get<StsService>(StsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should be defined', () => {
      expect(service.assumeRoleInSts).toBeDefined();
    });

    it('should send AssumeRoleCommand with correct args', async () => {
      await service.assumeRoleInSts(mockRoleArn, mockRoleSessionName, mockDurationSeconds, mockTags);

      expect(mockBaseStsClient).toReceiveCommandWith(AssumeRoleCommand, {
        RoleArn: mockRoleArn,
        RoleSessionName: mockRoleSessionName,
        DurationSeconds: mockDurationSeconds,
        Tags: mockTags,
      });
    });

    it('should return Credentials', async () => {
      expect(await service.assumeRoleInSts(mockRoleArn, mockRoleSessionName, mockDurationSeconds, mockTags)).toEqual({
        accessKeyId: mockCredentials.AccessKeyId,
        secretAccessKey: mockCredentials.SecretAccessKey,
        sessionToken: mockCredentials.SessionToken,
        expiration: mockCredentials.Expiration,
      });
    });
  });
});
