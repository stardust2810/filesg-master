import { MockService } from '../../../../typings/common.mock';
import { SqsService } from '../sqs.service';

export const mockSqsService: MockService<SqsService> = {
  sendMessageToQueueCoreEvents: jest.fn(),
};
