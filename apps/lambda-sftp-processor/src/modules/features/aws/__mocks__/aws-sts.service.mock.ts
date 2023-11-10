import { Credentials } from '@aws-sdk/types';
import { StsService as BaseStsService } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { StsService } from '../sts.service';

export const mockBaseStsService: MockService<BaseStsService> = {
  assumeRoleInSts: jest.fn(),
};

export const mockStsService: MockService<StsService> = {
  assumeSftpProcessorRole: jest.fn(),
};

export const mockCredentials: Credentials = {
  accessKeyId: 'mockAccessKeyId',
  secretAccessKey: 'mockSecretAccessKey',
};
