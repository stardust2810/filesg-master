import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Email } from '../../../../entities/email';
import { mockEmailEntityRepository } from '../__mocks__/email.entity.repository.mock';
import { mockEmail, mockEmailModels, mockEmailUuid, mockEmailUuid2 } from '../__mocks__/email.entity.service.mock';
import { createMockEmail } from '../__mocks__/email.mock';
import { EmailEntityRepository } from '../email.entity.repository';
import { EmailEntityService } from '../email.entity.service';

const helpers = require('../../../../utils/helpers');

describe('EmailEntityService', () => {
  let service: EmailEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailEntityService, { provide: EmailEntityRepository, useValue: mockEmailEntityRepository }],
    }).compile();

    service = module.get<EmailEntityService>(EmailEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildEmail', () => {
    it(`should call getRepository's create function with right params`, () => {
      const emailModel = mockEmailModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEmailUuid);

      service.buildEmail(emailModel);

      expect(mockEmailEntityRepository.getRepository().create).toBeCalledWith({
        ...emailModel,
      });
    });
  });

  describe('saveEmails', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedEmails = mockEmailModels.map((model, index) => createMockEmail({ uuid: `mockEmail-uuid-${index + 1}`, ...model }));

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEmailUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEmailUuid2);
      const buildEmailSpy = jest.spyOn(service, 'buildEmail');

      await service.saveEmails(mockEmailModels);

      mockEmailModels.forEach((model) => expect(buildEmailSpy).toBeCalledWith(model));
      expect(mockEmailEntityRepository.getRepository().save).toBeCalledWith(expectedEmails);
    });
  });

  describe('saveEmail', () => {
    it(`should call saveEmails function with a model in array`, async () => {
      const agencyModel = mockEmailModels[0];

      const saveEmailsSpy = jest.spyOn(service, 'saveEmails');

      await service.saveEmail(agencyModel);

      expect(saveEmailsSpy).toBeCalledWith([agencyModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retriveEmailByAwsMessageId', () => {
    const { awsMessageId } = mockEmail;

    it('return email when found', async () => {
      mockEmailEntityRepository.findEmailByAwsMessageId.mockResolvedValueOnce(mockEmail);

      expect(await service.retriveEmailByAwsMessageId(awsMessageId)).toEqual(mockEmail);
      expect(mockEmailEntityRepository.findEmailByAwsMessageId).toBeCalledWith(awsMessageId, undefined);
    });

    it('should throw EntityNotFoundException when toThrow set to true and email is not found', async () => {
      mockEmailEntityRepository.findEmailByAwsMessageId.mockResolvedValueOnce(null);

      await expect(service.retriveEmailByAwsMessageId(awsMessageId, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.EMAIL_SERVICE, Email.name, 'awsMessageId', `${awsMessageId}`),
      );
      expect(mockEmailEntityRepository.findEmailByAwsMessageId).toBeCalledWith(awsMessageId, undefined);
    });

    it('should return null when toThrow set to false and email is not found', async () => {
      mockEmailEntityRepository.findEmailByAwsMessageId.mockResolvedValueOnce(null);

      expect(await service.retriveEmailByAwsMessageId(awsMessageId, { toThrow: false })).toEqual(null);
      expect(mockEmailEntityRepository.findEmailByAwsMessageId).toBeCalledWith(awsMessageId, undefined);
    });
  });

  describe('retrieveEmailWithTransactionInfoByAwsMessageId', () => {
    const { awsMessageId } = mockEmail;

    it('return email when found', async () => {
      mockEmailEntityRepository.findEmailWithTransactionInfoByAwsMessageId.mockResolvedValueOnce(mockEmail);

      expect(await service.retrieveEmailWithTransactionInfoByAwsMessageId(awsMessageId)).toEqual(mockEmail);
      expect(mockEmailEntityRepository.findEmailWithTransactionInfoByAwsMessageId).toBeCalledWith(awsMessageId, undefined);
    });

    it('should throw EntityNotFoundException when toThrow set to true and email is not found', async () => {
      mockEmailEntityRepository.findEmailWithTransactionInfoByAwsMessageId.mockResolvedValueOnce(null);

      await expect(service.retrieveEmailWithTransactionInfoByAwsMessageId(awsMessageId, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.EMAIL_SERVICE,
          `${Email.name} with transactionInfo`,
          'awsMessageId',
          `${awsMessageId}`,
        ),
      );
      expect(mockEmailEntityRepository.findEmailWithTransactionInfoByAwsMessageId).toBeCalledWith(awsMessageId, undefined);
    });

    it('should return null when toThrow set to false and email is not found', async () => {
      mockEmailEntityRepository.findEmailWithTransactionInfoByAwsMessageId.mockResolvedValueOnce(null);

      expect(await service.retrieveEmailWithTransactionInfoByAwsMessageId(awsMessageId, { toThrow: false })).toEqual(null);
      expect(mockEmailEntityRepository.findEmailWithTransactionInfoByAwsMessageId).toBeCalledWith(awsMessageId, undefined);
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('updateEmailTransactionalStatus', () => {
    it(`should call activity repository's update function with right params`, async () => {
      const awsMessageId = 'aws-message-id-1';
      const eventType = 'event-type';
      const subEventType = 'sub-event-type';

      const expectedDataToUpdate: Partial<Email> = {
        eventType,
        subEventType,
      };

      await service.updateEmailTransactionalStatus(awsMessageId, eventType, subEventType);
      expect(mockEmailEntityRepository.getRepository().update).toBeCalledWith({ awsMessageId }, expectedDataToUpdate);
    });
  });
});
