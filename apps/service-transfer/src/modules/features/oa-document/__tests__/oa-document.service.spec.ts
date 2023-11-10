import { isValidFileSGDate, OA_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import { cloneDeep } from 'lodash';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockS3Service } from '../../aws/__mocks__/aws-s3.service.mock';
import { S3Service } from '../../aws/s3.service';
import {
  downloadFileFromS3Implementation,
  mockAgencyInfo,
  mockOAData,
  OASchemaValidationExpectionMessage,
} from '../__mocks__/oa-document.service.mock';
import { OaDocumentService } from '../oa-document.service';
import { OaFactory } from '../oa-generator.factory';

describe('OaDocumentService', () => {
  let service: OaDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OaDocumentService,
        OaFactory,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: S3Service, useValue: mockS3Service },
        {
          provide: 'Ajv',
          useFactory: () => {
            const ajv = new Ajv({ allErrors: true });
            addFormats(ajv);
            addErrors(ajv);
            ajv.addKeyword({
              keyword: 'isValidFileSGDate',
              type: 'string',
              validate: (schema: { isValidFileSGDate: boolean }, data: string) => {
                return isValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' })(data);
              },
            });
            return ajv;
          },
        },
      ],
    }).compile();

    service = module.get<OaDocumentService>(OaDocumentService);

    mockS3Service.downloadFileFromStaticFileBucket.mockImplementationOnce(downloadFileFromS3Implementation);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a OA document', async () => {
    const { signedDocument } = await service.createOADocument(OA_TYPE.LTVP, mockOAData, mockAgencyInfo);
    const proof = signedDocument.proof;

    expect(proof.length).toBe(1);
    expect(proof[0].proofPurpose).toBe('assertionMethod');
    expect(proof[0].type).toBe('OpenAttestationSignature2018');
    expect(proof[0].verificationMethod).toBe('did:ethr:0xF79D9Fa7825C3F1EAb7bC3c54a773a5D0415D482#controller');
  });

  it('should generate a OA document with special dob using valid date', async () => {
    const SPECIAL_DOB = '1995-01-01';
    const oaDocument = await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, specialDob: SPECIAL_DOB }, mockAgencyInfo);
    const generatedOADobValue = oaDocument.signedDocument.data.agencyData.specialDob.split(':').at(-1);
    expect(generatedOADobValue).toBe(SPECIAL_DOB);
  });

  it('should generate a OA document with special dob with year no day no month', async () => {
    const SPECIAL_DOB = '1995-00-00';
    const oaDocument = await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, specialDob: SPECIAL_DOB }, mockAgencyInfo);
    const generatedOADobValue = oaDocument.signedDocument.data.agencyData.specialDob.split(':').at(-1);
    expect(generatedOADobValue).toBe(SPECIAL_DOB);
  });

  it('should generate a OA document with special dob with year and month no day', async () => {
    const SPECIAL_DOB = '1995-01-00';
    const oaDocument = await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, specialDob: SPECIAL_DOB }, mockAgencyInfo);
    const generatedOADobValue = oaDocument.signedDocument.data.agencyData.specialDob.split(':').at(-1);
    expect(generatedOADobValue).toBe(SPECIAL_DOB);
  });

  it('should generate a OA document with special dob with year and day no month', async () => {
    const SPECIAL_DOB = '1995-00-01';
    const oaDocument = await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, specialDob: SPECIAL_DOB }, mockAgencyInfo);
    const generatedOADobValue = oaDocument.signedDocument.data.agencyData.specialDob.split(':').at(-1);
    expect(generatedOADobValue).toBe(SPECIAL_DOB);
  });

  it('should fail OA validation as the data type should be of type specific dob format when passign in string', async () => {
    let thrownError = null;
    const SPECIAL_DOB = 'hello';
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, specialDob: SPECIAL_DOB }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('dob should be in the following format YYYY-MM-DD or YYYY-MM-00 or YYYY-00-00');
  });

  it('should fail OA validation as the data type should be of type specific dob format when passing in invalid date', async () => {
    let thrownError = null;
    const SPECIAL_DOB = '2023-02-31';
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, specialDob: SPECIAL_DOB }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError).not.toBeNull();
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('dob should be in the following format YYYY-MM-DD or YYYY-MM-00 or YYYY-00-00');
  });

  it('should fail OA validation as the data type should be of type boolean', async () => {
    let thrownError = null;
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, booleanType: 'one' }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('must be boolean');
  });

  it('should fail OA validation as the data type should be of type string', async () => {
    let thrownError = null;
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, stringType: 1 }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('must be string');
  });

  it('should fail OA validation as the data type should be of type date for invalid type', async () => {
    let thrownError = null;
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, dateType: 'one' }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('must match format "date"');
  });

  it('should fail OA validation as the data type should be of type date for invalid date', async () => {
    let thrownError = null;
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, dateType: '1995-02-30' }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('must match format "date"');
  });

  it('should fail OA validation as the data type should be of type string array', async () => {
    let thrownError = null;
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, stringArrayType: 'one' }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('must be array');
  });

  it('should fail OA validation must not have additional properties', async () => {
    let thrownError = null;
    try {
      await service.createOADocument(OA_TYPE.LTVP, { ...mockOAData, dob: 'one' }, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError).not.toBeNull();
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe('must NOT have additional properties');
  });

  it('should fail OA validation missing property', async () => {
    let thrownError = null;
    try {
      const mockDataWithMissingRequiredProperty = cloneDeep(mockOAData);
      delete (mockDataWithMissingRequiredProperty as any).stringType;
      await service.createOADocument(OA_TYPE.LTVP, mockDataWithMissingRequiredProperty, mockAgencyInfo);
    } catch (err) {
      thrownError = (err as any).response.message;
    }
    expect(thrownError).not.toBeNull();
    expect(thrownError.message).toBe(OASchemaValidationExpectionMessage);
    expect(thrownError.error.length).toBe(1);
    expect(thrownError.error[0].message).toBe("must have required property 'stringType'");
  });

  describe('OA document obfuscation', () => {
    it('should ofbuscate entire agency data from oa document', async () => {
      const { signedDocument } = await service.createOADocument(OA_TYPE.LTVP, mockOAData, mockAgencyInfo);
      expect((signedDocument as any).data.agencyData).toBeTruthy();
      const ofbuscatedOADocument = service.obfuscateOa(signedDocument, ['agencyData']);
      expect((ofbuscatedOADocument as any).data.agencyData).toBeFalsy();
    });

    it('should ofbuscate a specific field from oa document', async () => {
      const { signedDocument } = await service.createOADocument(OA_TYPE.LTVP, mockOAData, mockAgencyInfo);
      expect((signedDocument as any).data.agencyData.stringType).toBeTruthy();
      const ofbuscatedOADocument = service.obfuscateOa(signedDocument, ['agencyData.stringType']);
      expect((ofbuscatedOADocument as any).data.agencyData.stringType).toBeFalsy();
    });
  });
});
