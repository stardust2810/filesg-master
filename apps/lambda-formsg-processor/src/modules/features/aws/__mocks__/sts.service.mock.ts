import { MockService } from '../../../../typings/common.mock';
import { StsService } from '../sts.service';

export const mockStsService: MockService<StsService> = {
  assumeFormSgProcessorRole: jest.fn(),
};
