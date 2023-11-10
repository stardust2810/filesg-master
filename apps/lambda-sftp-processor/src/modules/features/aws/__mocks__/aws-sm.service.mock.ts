import { SmService as BaseSmService } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { SmService } from '../sm.service';

export const mockBaseSmService: MockService<BaseSmService> = {
  getSecretValue: jest.fn(),
};

export const mockSmService: MockService<SmService> = {
  getSecretValue: jest.fn(),
};

export const mockKey = 'mockKey';
