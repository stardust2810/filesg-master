import { MockRepository } from '../../../../typings/common.mock';
import { NotificationHistoryEntityRepository } from '../notification-history.entity.repository';
import { createMockNotificationHistory } from './notification-history.mock';

export const mockNotificationHistoryEntityRepository: MockRepository<NotificationHistoryEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockNotificationHistory(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }),
  findNonSuccessNotificationHistoriesByIds: jest.fn(),
  findNonSuccessNotificationHistoryByDateRange: jest.fn(),
  findNotificationHistoryWithTransactionByMessageId: jest.fn(),
};
