/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException, InputValidationException } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  COMPONENT_ERROR_CODE,
  NOTIFICATION_TEMPLATE_TYPE,
  UpdateRecipientInfoRequest,
  VIEWABLE_ACTIVITY_TYPES,
} from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ActivityAcknowledgementNotRequiredException,
  ActivityHadAlreadyBeenAcknowledgedException,
  EmailInBlackListException,
} from '../../../../common/filters/custom-exceptions.filter';
import { Activity } from '../../../../entities/activity';
import { ActivityRecipientInfo } from '../../../../typings/common';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockUserEntityService } from '../../../entities/user/__mocks__/user.entity.service.mock';
import { UserEntityService } from '../../../entities/user/user.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockEmailBlackListService } from '../../email/__mocks__/email-black-list.service.mock';
import { EmailBlackListService } from '../../email/email-black-list.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { mockNotificationService } from '../../notification/__mocks__/notification.service.mock';
import { EmailService } from '../../notification/email.service';
import { NotificationService } from '../../notification/notification.service';
import {
  mockActivity,
  mockActivity2,
  mockActivityUuid,
  mockInitActivity,
  mockIssuer,
  TestTransactionActivityService,
} from '../__mocks__/transaction-activity.service.mock';

describe('TransactionActivityService', () => {
  let service: TestTransactionActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestTransactionActivityService,
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: EmailBlackListService, useValue: mockEmailBlackListService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();
    jest.clearAllMocks();
    service = module.get<TestTransactionActivityService>(TestTransactionActivityService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('acknowledgeActivity', () => {
    it('should update acknowledgedAt when isAcknowledgementRequired is true and acknowledgedAt is null', async () => {
      const mockActivityUuid = 'testActivityUuid';
      const mockUserId = 1;
      const mockAcknowledgementDetails = { isAcknowledgementRequired: true, acknowledgedAt: null };
      mockActivityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes.mockReturnValue(mockAcknowledgementDetails);

      // ensure new Date() returns same datetime
      const mockDate = new Date();
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);

      await service.acknowledgeActivity(mockActivityUuid, mockUserId);
      expect(mockActivityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes).toBeCalledWith(
        mockActivityUuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
        mockUserId,
      );

      expect(mockActivityEntityService.updateActivity).toBeCalledWith(mockActivityUuid, { acknowledgedAt: new Date() });
      spy.mockRestore();
    });

    it('should throw ActivityAcknowledgementNotRequiredException when isAcknowledgementRequired is false', async () => {
      const mockActivityUuid = 'testActivityUuid';
      const mockUserId = 1;
      let mockAcknowledgementDetails: Partial<Activity> = { isAcknowledgementRequired: false, acknowledgedAt: null };
      mockActivityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes.mockReturnValue(mockAcknowledgementDetails);
      await expect(service.acknowledgeActivity(mockActivityUuid, mockUserId)).rejects.toThrow(
        new ActivityAcknowledgementNotRequiredException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, mockActivityUuid),
      );

      mockAcknowledgementDetails = { isAcknowledgementRequired: false, acknowledgedAt: new Date() };
      mockActivityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes.mockReturnValue(mockAcknowledgementDetails);
      await expect(service.acknowledgeActivity(mockActivityUuid, mockUserId)).rejects.toThrow(
        new ActivityAcknowledgementNotRequiredException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, mockActivityUuid),
      );

      expect(mockActivityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes).toBeCalledWith(
        mockActivityUuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
        mockUserId,
      );

      expect(mockActivityEntityService.updateActivity).not.toBeCalled();
    });

    it('should throw ActivityHadAlreadyBeenAcknowledgedException when isAcknowledgementRequired is false', async () => {
      const mockActivityUuid = 'testActivityUuid';
      const mockUserId = 1;
      const mockAcknowledgementDetails: Partial<Activity> = { isAcknowledgementRequired: true, acknowledgedAt: new Date() };
      mockActivityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes.mockReturnValue(mockAcknowledgementDetails);
      await expect(service.acknowledgeActivity(mockActivityUuid, mockUserId)).rejects.toThrow(
        new ActivityHadAlreadyBeenAcknowledgedException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, mockActivityUuid),
      );

      expect(mockActivityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes).toBeCalledWith(
        mockActivityUuid,
        ACTIVITY_STATUS.COMPLETED,
        VIEWABLE_ACTIVITY_TYPES,
        mockUserId,
      );

      expect(mockActivityEntityService.updateActivity).not.toBeCalled();
    });
  });

  describe('updateRecipientInfo', () => {
    it('EmailInBlacklistException should be thrown when updated email is blacklisted', async () => {
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: '+98765432',
        email: 'helloworld@gmail.com',
        dob: '2002-02-02',
      };

      mockUserEntityService.retrieveUserWithEserviceAndAgencyById.mockResolvedValue(mockIssuer);
      jest.spyOn(service, 'retrieveActivityForUpdateInfo').mockResolvedValue(mockActivity);
      mockEmailBlackListService.isEmailBlackListed.mockRejectedValue(
        new EmailInBlackListException(COMPONENT_ERROR_CODE.TRANSACTION_ACTIVITY_SERVICE, [updatedInfo.email!]),
      );

      await expect(service.updateRecipientInfo(mockIssuer.id, mockActivity.uuid, updatedInfo)).rejects.toThrow(EmailInBlackListException);
    });

    it('sendTransactionalEmails should not be called when isNewEmail and updatedEmail is undefined', async () => {
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: '+6598765432',
        email: null,
        dob: '2022-01-01',
      };

      mockUserEntityService.retrieveUserWithEserviceAndAgencyById.mockResolvedValue(mockIssuer);
      jest.spyOn(service, 'retrieveActivityForUpdateInfo').mockResolvedValue(mockActivity);
      mockEmailBlackListService.isEmailBlackListed.mockResolvedValue(false);

      await service.updateRecipientInfo(mockIssuer.id, mockActivity.uuid, updatedInfo);

      expect(mockActivityEntityService.updateActivity).toBeCalledWith(mockActivityUuid, {
        recipientInfo: Object.assign({}, mockActivity.recipientInfo, {
          mobile: '+6598765432',
          dob: '2022-01-01',
        }),
      });
      expect(mockNotificationService.processNotifications).toBeCalledTimes(0);
    });

    it('sendTransactionalEmails should be called when there is no error and isNewEmail', async () => {
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: '+6598765432',
        email: 'helloworld@gmail.com',
        dob: '2022-01-01',
      };

      mockUserEntityService.retrieveUserWithEserviceAndAgencyById.mockResolvedValue(mockIssuer);
      jest.spyOn(service, 'retrieveActivityForUpdateInfo').mockResolvedValue(mockActivity);
      mockEmailBlackListService.isEmailBlackListed.mockResolvedValue(false);

      await service.updateRecipientInfo(mockIssuer.id, mockActivity.uuid, updatedInfo);

      expect(mockActivityEntityService.updateActivity).toBeCalledWith(mockActivityUuid, {
        recipientInfo: Object.assign({}, mockActivity.recipientInfo, {
          mobile: '+6598765432',
          email: 'helloworld@gmail.com',
          dob: '2022-01-01',
        }),
      });
      expect(mockNotificationService.processNotifications).toBeCalledWith([mockActivity.id], {
        templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
      });
    });

    it('mobile and dob should not be updated when there are no changes', async () => {
      const updatedInfo: UpdateRecipientInfoRequest = {
        email: 'helloworld+1@gmail.com',
        dob: '1990-01-01',
        contact: '+6598989898',
      };

      mockUserEntityService.retrieveUserWithEserviceAndAgencyById.mockResolvedValue(mockIssuer);
      jest.spyOn(service, 'retrieveActivityForUpdateInfo').mockResolvedValue(mockActivity);
      mockEmailBlackListService.isEmailBlackListed.mockResolvedValue(false);

      await service.updateRecipientInfo(mockIssuer.id, mockActivity.uuid, updatedInfo);

      expect(mockActivityEntityService.updateActivity).toBeCalledWith(mockActivityUuid, {
        recipientInfo: Object.assign({}, mockActivity.recipientInfo, {
          email: 'helloworld+1@gmail.com',
        }),
      });
      expect(mockNotificationService.processNotifications).toBeCalledWith([mockActivity.id], {
        templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
      });
    });
  });

  describe('retrieveActivityForUpdateInfo', () => {
    it('non-existent activity should throw EntityNotFoundException', async () => {
      mockActivityEntityService.retrieveActivitiesDetailsRequiredForEmail.mockResolvedValue([]);

      await expect(service.retrieveActivityForUpdateInfo(mockActivityUuid, mockIssuer)).rejects.toThrow(EntityNotFoundException);
    });

    it('non completed activity should throw EntityNotFoundException', async () => {
      mockActivityEntityService.retrieveActivitiesDetailsRequiredForEmail.mockResolvedValue([mockInitActivity]);

      await expect(service.retrieveActivityForUpdateInfo(mockActivityUuid, mockIssuer)).rejects.toThrow(EntityNotFoundException);
    });

    it('activity of another Eservice should throw EntityNotFoundException', async () => {
      mockActivityEntityService.retrieveActivitiesDetailsRequiredForEmail.mockResolvedValue([mockActivity2]);

      await expect(service.retrieveActivityForUpdateInfo(mockActivityUuid, mockIssuer)).rejects.toThrow(EntityNotFoundException);
    });

    it('activity should be return if there is no validation errro', async () => {
      mockActivityEntityService.retrieveActivitiesDetailsRequiredForEmail.mockResolvedValue([mockActivity]);

      await expect(service.retrieveActivityForUpdateInfo(mockActivityUuid, mockIssuer)).resolves.toEqual(mockActivity);
    });
  });

  describe('updateActivityRecipientInfo', () => {
    it('InputValidationException should be thrown if existing is the same as updated info', () => {
      const existing: ActivityRecipientInfo = {
        name: 'mockName',
        dob: '1991-01-01',
        mobile: '+98765432',
        email: 'helloworld@gmail.com',
      };
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: '+98765432',
        email: 'helloworld@gmail.com',
        dob: '1991-01-01',
      };

      expect(() => service.updateActivityRecipientInfo(existing, updatedInfo)).toThrow(InputValidationException);
    });

    it('InputValidationException should be thrown if existing email is undefined and updated email is null', () => {
      const existing: ActivityRecipientInfo = {
        name: 'mockName',
        dob: '1991-01-01',
        mobile: '+98765432',
      };
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: '+98765432',
        email: null,
        dob: '1991-01-01',
      };

      expect(() => service.updateActivityRecipientInfo(existing, updatedInfo)).toThrow(InputValidationException);
    });

    it('InputValidationException should be thrown if existing mobile is undefined and updated contact is null', () => {
      const existing: ActivityRecipientInfo = {
        name: 'mockName',
        dob: '1991-01-01',
        email: 'helloworld@gmail.com',
      };
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: null,
        email: 'helloworld@gmail.com',
        dob: '1991-01-01',
      };

      expect(() => service.updateActivityRecipientInfo(existing, updatedInfo)).toThrow(InputValidationException);
    });

    it('InputValidationException should be thrown if both existing are undefined and updated are null', () => {
      const existing: ActivityRecipientInfo = {
        name: 'mockName',
        dob: '1991-01-01',
      };
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: null,
        email: null,
        dob: '1991-01-01',
      };

      expect(() => service.updateActivityRecipientInfo(existing, updatedInfo)).toThrow(InputValidationException);
    });

    it('Should return isNewEmail: true when only email is updated', () => {
      const existing: ActivityRecipientInfo = {
        name: 'mockName',
        dob: '1991-01-01',
        mobile: '+98765432',
        email: 'helloworld@gmail.com',
      };
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: '+98765432',
        email: 'helloworld+1@gmail.com',
        dob: '1991-01-01',
      };

      const result = service.updateActivityRecipientInfo(existing, updatedInfo);

      expect(result).toEqual({
        isNewEmail: true,
        isNewContact: false,
        isNewDob: false,
      });
      expect(existing.email).toEqual(updatedInfo.email);
    });

    it('Should return isNewContact: true when only contact is updated', () => {
      const existing: ActivityRecipientInfo = {
        name: 'mockName',
        dob: '1991-01-01',
        mobile: '+98765432',
        email: 'helloworld@gmail.com',
      };
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: '+98765431',
        email: 'helloworld@gmail.com',
        dob: '1991-01-01',
      };

      const result = service.updateActivityRecipientInfo(existing, updatedInfo);

      expect(result).toEqual({
        isNewEmail: false,
        isNewContact: true,
        isNewDob: false,
      });
      expect(existing.mobile).toEqual(updatedInfo.contact);
    });

    it('Should return isNewDob: true, isNewContact: true and isNewEmail: true when all are updated', () => {
      const existing: ActivityRecipientInfo = {
        name: 'mockName',
        dob: '1991-01-01',
        mobile: '+98765432',
        email: 'helloworld@gmail.com',
      };
      const updatedInfo: UpdateRecipientInfoRequest = {
        contact: null,
        email: null,
        dob: null,
      };

      const result = service.updateActivityRecipientInfo(existing, updatedInfo);

      expect(result).toEqual({
        isNewEmail: true,
        isNewContact: true,
        isNewDob: true,
      });
      expect(existing.email).toBeUndefined();
      expect(existing.mobile).toBeUndefined();
      expect(existing.dob).toBeUndefined();
    });
  });
});
