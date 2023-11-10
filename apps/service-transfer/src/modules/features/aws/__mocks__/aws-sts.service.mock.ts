import { StsService as BaseStsService } from '@filesg/aws';
import { AssumeTransferMoveRole, AssumeUploadMoveRole } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { StsService } from '../sts.service';

export const mockBaseStsService: MockService<BaseStsService> = {
  assumeRoleInSts: jest.fn(),
};

export const mockStsService: MockService<StsService> = {
  assumeUploadMoveRole: jest.fn(),
  assumeTransferMoveRole: jest.fn(),
  assumeUploadRole: jest.fn(),
  assumeMoveRole: jest.fn(),
  assumeRetrieveRole: jest.fn(),
  assumeDeleteRole: jest.fn(),
};

export const mockReceiver = 'mockReceiver';
export const mockOwner = 'mockOwner';

export const mockAssumeUploadMoveRole: AssumeUploadMoveRole = {
  receiver: mockReceiver,
};

export const mockAssumeTransferMoveRole: AssumeTransferMoveRole = {
  owner: mockOwner,
  receiver: mockReceiver,
};
