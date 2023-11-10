import { Credentials } from '@aws-sdk/types';
import { StsService as BaseStsService } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { StsService } from '../sts.service';

export const mockStsService: MockService<StsService> = {
  assumeDocumentEncryptionRole: jest.fn(),
};

export const mockBaseStsService: MockService<BaseStsService> = {
  assumeRoleInSts: jest.fn(),
};

export const mockCredentials: Credentials = {
  accessKeyId: 'mockAccessKeyId',
  secretAccessKey: 'mockSecretAccessKey',
};
