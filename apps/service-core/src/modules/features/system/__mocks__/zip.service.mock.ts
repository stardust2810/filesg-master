import { ZipService } from '@filesg/zipper';

import { MockService } from '../../../../typings/common.mock';

export const mockZipService: MockService<ZipService> = {
  zipToStream: jest.fn(),
  zipDirToStream: jest.fn(),
  onApplicationBootstrap: jest.fn(),
};
