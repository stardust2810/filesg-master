import { StsService as BaseStsService } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { StsService } from '../sts.service';

export const mockBaseStsService: MockService<BaseStsService> = {
  assumeRoleInSts: jest.fn(),
};

export const mockStsService: MockService<StsService> = {
  assumeScanMoveRole: jest.fn(),
};
