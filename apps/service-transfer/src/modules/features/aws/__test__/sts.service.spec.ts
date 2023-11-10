/* eslint-disable sonarjs/no-duplicate-string */
import { StsService as BaseStsService } from '@filesg/aws';
import { UnknownFileSessionTypeException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, FILE_SESSION_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import {
  mockAssumeTransferMoveRole,
  mockAssumeUploadMoveRole,
  mockBaseStsService,
  mockOwner,
  mockReceiver,
} from '../__mocks__/aws-sts.service.mock';
import { StsService } from '../sts.service';

describe('StsService', () => {
  let service: StsService;

  const { uploadMoveRoleArn, transferMoveRoleArn, uploadRoleArn, retrieveRoleArn, assumeRoleSessionDuration } =
    mockFileSGConfigService.awsConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StsService,
        {
          provide: BaseStsService,
          useValue: mockBaseStsService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
      ],
    }).compile();

    service = module.get<StsService>(StsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assumeUploadMove', () => {
    it('should be defined', () => {
      expect(service.assumeUploadMoveRole).toBeDefined();
    });

    it('should call baseStsService assumeRoleInSts with correct args', async () => {
      await service.assumeUploadMoveRole(mockReceiver);

      expect(mockBaseStsService.assumeRoleInSts).toBeCalledWith(uploadMoveRoleArn, 'upload-move', assumeRoleSessionDuration, [
        {
          Key: 'receiver',
          Value: mockReceiver,
        },
      ]);
    });
  });

  describe('assumeTransferMoveRole', () => {
    it('should be defined', () => {
      expect(service.assumeTransferMoveRole).toBeDefined();
    });

    it('should call baseStsService assumeRoleInSts with correct args', async () => {
      await service.assumeTransferMoveRole(mockOwner, mockReceiver);

      expect(mockBaseStsService.assumeRoleInSts).toBeCalledWith(transferMoveRoleArn, 'transfer-move', assumeRoleSessionDuration, [
        { Key: 'sender', Value: mockOwner },
        { Key: 'receiver', Value: mockReceiver },
      ]);
    });
  });

  describe('assumeUploadRole', () => {
    it('should be defined', () => {
      expect(service.assumeUploadRole).toBeDefined();
    });

    it('should call baseStsService assumeRoleInSts with correct args', async () => {
      mockBaseStsService.assumeRoleInSts.mockResolvedValue({ expiration: new Date(1234) });

      await service.assumeUploadRole();

      expect(mockBaseStsService.assumeRoleInSts).toBeCalledWith(uploadRoleArn, 'upload', assumeRoleSessionDuration);
    });
  });

  describe('assumeMoveRole', () => {
    it('should be defined', () => {
      expect(service.assumeMoveRole).toBeDefined();
    });

    it('should call assumeUploadMoveRole if upload session type', async () => {
      jest.spyOn(service, 'assumeUploadMoveRole');

      await service.assumeMoveRole(FILE_SESSION_TYPE.UPLOAD, mockAssumeUploadMoveRole);

      expect(service.assumeUploadMoveRole).toBeCalledWith(mockAssumeUploadMoveRole.receiver);
    });

    it('should call assumeTransferMoveRole if upload session type', async () => {
      jest.spyOn(service, 'assumeTransferMoveRole');

      const { owner, receiver } = mockAssumeTransferMoveRole;

      await service.assumeMoveRole(FILE_SESSION_TYPE.TRANSFER, mockAssumeTransferMoveRole);

      expect(service.assumeTransferMoveRole).toBeCalledWith(owner, receiver);
    });

    it('should throw UnknownFileSessionTypeException if not either file session type', async () => {
      await expect(service.assumeMoveRole(FILE_SESSION_TYPE.DOWNLOAD, mockAssumeTransferMoveRole)).rejects.toThrow(
        new UnknownFileSessionTypeException(COMPONENT_ERROR_CODE.STS_SERVICE, FILE_SESSION_TYPE.DOWNLOAD, 'assume role'),
      );
    });
  });

  describe('assumeRetrieveRole', () => {
    it('should be defined', () => {
      expect(service.assumeRetrieveRole).toBeDefined();
    });

    it('should call baseStsService assumeRoleInSts with correct args', async () => {
      await service.assumeRetrieveRole(mockOwner);

      expect(mockBaseStsService.assumeRoleInSts).toBeCalledWith(retrieveRoleArn, 'upload', assumeRoleSessionDuration, [
        {
          Key: 'owner',
          Value: mockOwner,
        },
      ]);
    });
  });
});
