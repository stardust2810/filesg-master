import { MockService } from '../../../../typings/common.mock';
import { SliftService } from '../slift.service';

export const mockSliftService: MockService<SliftService> = {
  init: jest.fn(),
  decrypt: jest.fn(),
};
