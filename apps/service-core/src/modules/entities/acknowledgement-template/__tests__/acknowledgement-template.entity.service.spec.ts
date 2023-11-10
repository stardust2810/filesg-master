/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { In, InsertResult } from 'typeorm';

import { AcknowledgementTemplate } from '../../../../entities/acknowledgement-template';
import { mockAcknowledgementTemplateEntityRepository } from '../__mocks__/acknowledgement-template.entity.repository.mock';
import {
  mockAcknowledgementTemplate,
  mockAcknowledgementTemplateModels,
  mockAcknowledgementTemplateUuid,
  mockAcknowledgementTemplateUuid2,
} from '../__mocks__/acknowledgement-template.entity.service.mock';
import { createMockAcknowledgementTemplate } from '../__mocks__/acknowledgement-template.mock';
import { AcknowledgementTemplateEntityRepository } from '../acknowledgement-template.entity.repository';
import { AcknowledgementTemplateEntityService } from '../acknowledgement-template.entity.service';

const helpers = require('../../../../utils/helpers');

describe('AcknowledgementTemplateEntityService', () => {
  let service: AcknowledgementTemplateEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcknowledgementTemplateEntityService,
        { provide: AcknowledgementTemplateEntityRepository, useValue: mockAcknowledgementTemplateEntityRepository },
      ],
    }).compile();

    service = module.get<AcknowledgementTemplateEntityService>(AcknowledgementTemplateEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildAcknowledgementTemplate', () => {
    it(`should call getRepository's create function with right params`, () => {
      const acknowledgementTemplateModel = mockAcknowledgementTemplateModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAcknowledgementTemplateUuid);

      service.buildAcknowledgementTemplate(acknowledgementTemplateModel);

      expect(mockAcknowledgementTemplateEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockAcknowledgementTemplateUuid,
        ...acknowledgementTemplateModel,
      });
    });
  });

  describe('insertAcknowledgementTemplates', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedAcknowledgementTemplates = mockAcknowledgementTemplateModels.map((model, index) =>
        createMockAcknowledgementTemplate({ uuid: `mockAcknowledgementTemplate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAcknowledgementTemplateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAcknowledgementTemplateUuid2);
      const buildAcknowledgementTemplateSpy = jest.spyOn(service, 'buildAcknowledgementTemplate');

      await service.insertAcknowledgementTemplates(mockAcknowledgementTemplateModels);

      mockAcknowledgementTemplateModels.forEach((model) => expect(buildAcknowledgementTemplateSpy).toBeCalledWith(model));
      expect(mockAcknowledgementTemplateEntityRepository.getRepository().insert).toBeCalledWith(expectedAcknowledgementTemplates);
    });

    it('should return acknowledgement template entities if returnEntity is set to true', async () => {
      const mockIdentifiers = [{ identifier: { id: 1 } }, { identifier: { id: 2 } }];

      const insertResult: InsertResult = {
        identifiers: mockIdentifiers,
        generatedMaps: [],
        raw: {},
      };

      const expectedAcknowledgementTemplates = mockAcknowledgementTemplateModels.map((model, index) =>
        createMockAcknowledgementTemplate({ uuid: `mockAcknowledgementTemplate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAcknowledgementTemplateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAcknowledgementTemplateUuid2);
      const buildAcknowledgementTemplateSpy = jest.spyOn(service, 'buildAcknowledgementTemplate');
      mockAcknowledgementTemplateEntityRepository.getRepository().insert.mockResolvedValueOnce(insertResult);
      mockAcknowledgementTemplateEntityRepository.getRepository().find.mockResolvedValueOnce(expectedAcknowledgementTemplates);

      expect(await service.insertAcknowledgementTemplates(mockAcknowledgementTemplateModels, true)).toEqual(
        expectedAcknowledgementTemplates,
      );

      mockAcknowledgementTemplateModels.forEach((model) => expect(buildAcknowledgementTemplateSpy).toBeCalledWith(model));
      expect(mockAcknowledgementTemplateEntityRepository.getRepository().insert).toBeCalledWith(expectedAcknowledgementTemplates);
      expect(mockAcknowledgementTemplateEntityRepository.getRepository().find).toBeCalledWith({
        where: {
          id: In(insertResult.identifiers.map((identifier) => identifier.id)),
        },
        order: {
          id: 'ASC',
        },
      });
    });
  });

  describe('saveAcknowledgementTemplates', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedAcknowledgementTemplates = mockAcknowledgementTemplateModels.map((model, index) =>
        createMockAcknowledgementTemplate({ uuid: `mockAcknowledgementTemplate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAcknowledgementTemplateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAcknowledgementTemplateUuid2);
      const buildAcknowledgementTemplateSpy = jest.spyOn(service, 'buildAcknowledgementTemplate');

      await service.saveAcknowledgementTemplates(mockAcknowledgementTemplateModels);

      mockAcknowledgementTemplateModels.forEach((model) => expect(buildAcknowledgementTemplateSpy).toBeCalledWith(model));
      expect(mockAcknowledgementTemplateEntityRepository.getRepository().save).toBeCalledWith(expectedAcknowledgementTemplates);
    });
  });

  describe('saveAcknowledgementTemplate', () => {
    it(`should call saveAcknowledgementTemplates function with a model in array`, async () => {
      const acknowledgementTemplateModel = mockAcknowledgementTemplateModels[0];

      const saveAcknowledgementTemplatesSpy = jest.spyOn(service, 'saveAcknowledgementTemplates');

      await service.saveAcknowledgementTemplate(acknowledgementTemplateModel);

      expect(saveAcknowledgementTemplatesSpy).toBeCalledWith([acknowledgementTemplateModel], undefined);
    });
  });

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  describe('retrieveAcknowledgementTemplateByUuid', () => {
    it('should return acknowledgement template when found', async () => {
      mockAcknowledgementTemplateEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockAcknowledgementTemplate);

      expect(await service.retrieveAcknowledgementTemplateByUuid(mockAcknowledgementTemplateUuid)).toEqual(mockAcknowledgementTemplate);
      expect(mockAcknowledgementTemplateEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uuid: mockAcknowledgementTemplateUuid },
      });
    });

    it('should throw EntityNotFoundException when toThrow set to true and acknowledgement template is not found', async () => {
      mockAcknowledgementTemplateEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveAcknowledgementTemplateByUuid(mockAcknowledgementTemplateUuid, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.ACKNOWLEDGEMENT_TEMPLATE_ENTITY_SERVICE,
          AcknowledgementTemplate.name,
          'uuid',
          `${mockAcknowledgementTemplateUuid}`,
        ),
      );
      expect(mockAcknowledgementTemplateEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uuid: mockAcknowledgementTemplateUuid },
      });
    });

    it('should return null when toThrow set to false and acknowledgement template is not found', async () => {
      mockAcknowledgementTemplateEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      expect(await service.retrieveAcknowledgementTemplateByUuid(mockAcknowledgementTemplateUuid, { toThrow: false })).toEqual(null);
      expect(mockAcknowledgementTemplateEntityRepository.getRepository().findOne).toBeCalledWith({
        where: { uuid: mockAcknowledgementTemplateUuid },
      });
    });
  });
});
