import { MockService } from '../../../../typings/common.mock';
import { FormSgService } from '../formsg.service';

export const mockFormSgService: MockService<FormSgService> = {
  verifyRequestorEmail: jest.fn(),
};
