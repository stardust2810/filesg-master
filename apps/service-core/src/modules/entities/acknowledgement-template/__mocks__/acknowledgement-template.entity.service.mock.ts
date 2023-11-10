import { AcknowledgementTemplateCreationModel } from '../../../../entities/acknowledgement-template';
import { MockService } from '../../../../typings/common.mock';
import { AcknowledgementTemplateEntityService } from '../acknowledgement-template.entity.service';
import { createMockAcknowledgementTemplate } from './acknowledgement-template.mock';

export const mockAcknowledgementTemplateEntityService: MockService<AcknowledgementTemplateEntityService> = {
  // Create
  buildAcknowledgementTemplate: jest.fn(),
  insertAcknowledgementTemplates: jest.fn(),
  saveAcknowledgementTemplates: jest.fn(),
  saveAcknowledgementTemplate: jest.fn(),

  // Retrieve
  retrieveAcknowledgementTemplateByUuid: jest.fn(),
};

export const mockAcknowledgementTemplateUuid = 'mockAcknowledgementTemplate-uuid-1';
export const mockAcknowledgementTemplateUuid2 = 'mockAcknowledgementTemplate-uuid-2';

export const mockAcknowledgementTemplate = createMockAcknowledgementTemplate({
  id: 1,
  uuid: mockAcknowledgementTemplateUuid,
  name: 'LTVP Acknowledgement Template',
  content: {
    content: [
      {
        content: ['Some LTVP content'],
      },
    ],
  },
});

export const mockAcknowledgementTemplateModels: AcknowledgementTemplateCreationModel[] = [
  {
    name: 'LTVP Acknowledgement Template',
    content: {
      content: [
        {
          content: ['Some content'],
        },
      ],
    },
  },
  {
    name: 'STP Acknowledgement Template',
    content: {
      content: [
        {
          content: ['Some STP content'],
        },
      ],
    },
  },
];
