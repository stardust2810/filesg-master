import { FileUploadAgencyInfo } from '@filesg/common';
import { Readable } from 'stream';

import { MockService } from '../../../../typings/common.mock';
import { OaDocumentService } from '../oa-document.service';

export const mockOaDocumentService: MockService<OaDocumentService> = {
  createOADocument: jest.fn(),
  obfuscateOa: jest.fn(),
};

export const mockAgencyInfo: FileUploadAgencyInfo = {
  name: 'Immigration & Checkpoints Authority',
  code: 'ICA',
  identityProofLocation: 'ica.gov.sg',
  sk: '0xee8f2c8a91d151cf93368097d6c414037018d293d8adf26ab5fe780044f2b42c',
};

export const mockTestSchema = {
  schema: {
    type: 'object',
    properties: {
      stringType: { type: 'string' },
      dateType: { type: 'string', format: 'date' },
      specialDob: { type: 'string', isValidFileSGDate: true },
      stringArrayType: { type: 'array', items: { type: 'string' }, minItems: 1 },
      booleanType: { type: 'boolean' },
    },
    required: ['stringType', 'dateType', 'specialDob', 'stringArrayType', 'booleanType'],
    additionalProperties: false,
    errorMessage: {
      properties: {
        specialDob: 'dob should be in the following format YYYY-MM-DD or YYYY-MM-00 or YYYY-00-00',
      },
    },
  },
};

export const mockOAData = {
  stringType: 'hello',
  dateType: '2018-01-30',
  specialDob: '1995-00-00',
  stringArrayType: ['one', 'two', 'three'],
  booleanType: true,
};

export const OASchemaValidationExpectionMessage = '[OASchemaValidationException] JSON data to generate OA file failed validation';

export const downloadFileFromS3Implementation = async () => ({ Body: Readable.from(JSON.stringify(mockTestSchema)) });
