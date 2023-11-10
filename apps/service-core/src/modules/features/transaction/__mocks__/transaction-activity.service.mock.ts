import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  UpdateRecipientInfoRequest,
} from '@filesg/common';

import { ProgrammaticUser } from '../../../../entities/user';
import { ActivityRecipientInfo } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { TransactionActivityService } from '../transaction-activity.service';

export class TestTransactionActivityService extends TransactionActivityService {
  public async retrieveActivityForUpdateInfo(activityUuid: string, issuer: ProgrammaticUser) {
    return await super.retrieveActivityForUpdateInfo(activityUuid, issuer);
  }

  public updateActivityRecipientInfo(existingRecipientInfo: ActivityRecipientInfo, updatedInfo: UpdateRecipientInfoRequest) {
    return super.updateActivityRecipientInfo(existingRecipientInfo, updatedInfo);
  }
}

export const mockTransactionActivityService: MockService<TransactionActivityService> = {
  retrieveActivities: jest.fn(),
  retrieveActivityDetails: jest.fn(),
  validateActivityNonSingpassRetrievable: jest.fn(),
  updateRecipientInfo: jest.fn(),
  acknowledgeActivity: jest.fn(),
};

export const mockActivityUuid = 'mockActivityUuid';
export const mockProgrammaticUserUuid = 'mockProgrammaticUser-uuid-1';

export const mockEservice = createMockEservice({
  id: 1,
  name: 'ICA',
  emails: ['ica@gmail.com'],
});

export const mockEservice2 = createMockEservice({
  id: 2,
  name: 'FILESG',
  emails: ['filesg@gmail.com'],
});

export const mockIssuer = createMockProgrammaticUser({
  uuid: mockProgrammaticUserUuid,
  id: 1,
  isOnboarded: true,
  status: STATUS.ACTIVE,
  clientId: 'user-client-1',
  clientSecret: 'user-client-secret-1',
  eservices: [mockEservice],
});

export const mockInitActivity = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.INIT,
  transaction: createMockTransaction({
    name: 'mockTransactionName',
    type: TRANSACTION_TYPE.TRANSFER,
    status: TRANSACTION_STATUS.COMPLETED,
    creationMethod: TRANSACTION_CREATION_METHOD.API,
    application: createMockApplication({
      eservice: mockEservice,
    }),
  }),
});

export const mockActivity = createMockActivity({
  id: 1,
  uuid: mockActivityUuid,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: {
    name: 'mockName',
    dob: '1990-01-01',
    email: 'what.a.email@gmail.com',
    mobile: '+6598989898',
  },
  transaction: createMockTransaction({
    name: 'mockTransactionName',
    type: TRANSACTION_TYPE.TRANSFER,
    status: TRANSACTION_STATUS.COMPLETED,
    creationMethod: TRANSACTION_CREATION_METHOD.API,
    application: createMockApplication({
      eservice: mockEservice,
    }),
  }),
});

export const mockActivity2 = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  transaction: createMockTransaction({
    name: 'mockTransactionName',
    type: TRANSACTION_TYPE.TRANSFER,
    status: TRANSACTION_STATUS.COMPLETED,
    creationMethod: TRANSACTION_CREATION_METHOD.API,
    application: createMockApplication({
      eservice: mockEservice2,
    }),
  }),
});
