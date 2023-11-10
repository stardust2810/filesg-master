import { Test, TestingModule } from '@nestjs/testing';

import { mockTransactionCustomMessageTemplateEntityRepository } from '../__mocks__/transaction-custom-message-template.entity.repository.mock';
import { mockTransactionCustomMessageTemplateModels } from '../__mocks__/transaction-custom-message-template.entity.service.mock';
import {
  mockTransactionCustomMessageTemplateUuid,
  mockTransactionCustomMessageTemplateUuid2,
} from '../__mocks__/transaction-custom-message-template.entity.service.mock';
import { createMockTransactionCustomMessageTemplate } from '../__mocks__/transaction-custom-message-template.mock';
import { TransactionCustomMessageTemplateEntityRepository } from '../transaction-custom-message-template.entity.repository';
import { TransactionCustomMessageTemplateEntityService } from '../transaction-custom-message-template.entity.service';

const helpers = require('../../../../utils/helpers');

describe('TransactionCustomMessageTemplateEntityService', () => {
  let service: TransactionCustomMessageTemplateEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionCustomMessageTemplateEntityService,
        { provide: TransactionCustomMessageTemplateEntityRepository, useValue: mockTransactionCustomMessageTemplateEntityRepository },
      ],
    }).compile();

    service = module.get<TransactionCustomMessageTemplateEntityService>(TransactionCustomMessageTemplateEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildTransactionCustomMessageTemplate', () => {
    it(`should call getRepository's create function with right params`, () => {
      const transactionCustomMessageTemplateModel = mockTransactionCustomMessageTemplateModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionCustomMessageTemplateUuid);

      service.buildTransactionCustomMessageTemplate(transactionCustomMessageTemplateModel);

      expect(mockTransactionCustomMessageTemplateEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockTransactionCustomMessageTemplateUuid,
        ...transactionCustomMessageTemplateModel,
      });
    });
  });

  describe('insertTransactionCustomMessageTemplates', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedTransactionCustomMessageTemplates = mockTransactionCustomMessageTemplateModels.map((model, index) =>
        createMockTransactionCustomMessageTemplate({ uuid: `mockTransactionCustomMessageTemplate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionCustomMessageTemplateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionCustomMessageTemplateUuid2);
      const buildATransactionCustomMessageTemplateSpy = jest.spyOn(service, 'buildTransactionCustomMessageTemplate');

      await service.insertTransactionCustomMessageTemplates(mockTransactionCustomMessageTemplateModels);

      mockTransactionCustomMessageTemplateModels.forEach((model) =>
        expect(buildATransactionCustomMessageTemplateSpy).toBeCalledWith(model),
      );
      expect(mockTransactionCustomMessageTemplateEntityRepository.getRepository().insert).toBeCalledWith(
        expectedTransactionCustomMessageTemplates,
      );
    });
  });

  describe('saveTransactionCustomMessageTemplates', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedTransactionCustomMessageTemplates = mockTransactionCustomMessageTemplateModels.map((model, index) =>
        createMockTransactionCustomMessageTemplate({ uuid: `mockTransactionCustomMessageTemplate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionCustomMessageTemplateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionCustomMessageTemplateUuid2);
      const buildTransactionCustomMessageTemplateSpy = jest.spyOn(service, 'buildTransactionCustomMessageTemplate');

      await service.saveTransactionCustomMessageTemplates(mockTransactionCustomMessageTemplateModels);

      mockTransactionCustomMessageTemplateModels.forEach((model) => expect(buildTransactionCustomMessageTemplateSpy).toBeCalledWith(model));
      expect(mockTransactionCustomMessageTemplateEntityRepository.getRepository().save).toBeCalledWith(
        expectedTransactionCustomMessageTemplates,
      );
    });
  });

  describe('saveTransactionCustomMessageTemplate', () => {
    it(`should call saveTransactionCustomMessageTemplates function with a model in array`, async () => {
      const agencyModel = mockTransactionCustomMessageTemplateModels[0];
      const saveTransactionCustomMessageTemplateSpy = jest.spyOn(service, 'saveTransactionCustomMessageTemplates');

      await service.saveTransactionCustomMessageTemplate(agencyModel);

      expect(saveTransactionCustomMessageTemplateSpy).toBeCalledWith([agencyModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveTransactionCustomMessageTemplate', () => {
    it(`should call retrieveTransactionCustomMessageTemplate function with a model in array`, async () => {
      const agencyModel = mockTransactionCustomMessageTemplateModels[0];
      const saveTransactionCustomMessageTemplateSpy = jest.spyOn(service, 'saveTransactionCustomMessageTemplates');

      await service.saveTransactionCustomMessageTemplate(agencyModel);

      expect(saveTransactionCustomMessageTemplateSpy).toBeCalledWith([agencyModel], undefined);
    });
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('updateTransactionCustomMessageTemplate', () => {
    it(`should call updateTransactionCustomMessageTemplate repository's updateActivity function with right params`, async () => {
      const uuid = 'mock-uuid-1';
      const dataToBeUpdated = { name: 'newName' };

      await service.updateTransactionCustomMessageTemplate(uuid, dataToBeUpdated);

      expect(mockTransactionCustomMessageTemplateEntityRepository.updateTransactionCustomMessageTemplate).toBeCalledWith(
        uuid,
        dataToBeUpdated,
        undefined,
      );
    });
  });
});
