import { LambdaService } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';

export const mockLambdaService: MockService<LambdaService> = {
  createAssumedClient: jest.fn(),
  invokeLambda: jest.fn(),
};
