import { MockRepository } from '../../../../typings/common.mock';
import { AcknowledgementTemplateEntityRepository } from '../acknowledgement-template.entity.repository';
import { createMockAcknowledgementTemplate } from './acknowledgement-template.mock';

export const mockAcknowledgementTemplateEntityRepository: MockRepository<AcknowledgementTemplateEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockAcknowledgementTemplate(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
  }),
};
