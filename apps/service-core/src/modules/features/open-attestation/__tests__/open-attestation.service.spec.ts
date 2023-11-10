import { OaDocumentRevocationTypeMapper } from '@filesg/common';
import { RedisService } from '@filesg/redis';
import * as OpenAttestation from '@govtechsg/open-attestation';
import { Test, TestingModule } from '@nestjs/testing';

import { InvalidOaDocumentException } from '../../../../common/filters/custom-exceptions.filter';
import { mockAgencyEntityService } from '../../../entities/agency/__mocks__/agency.entity.service.mock';
import { AgencyEntityService } from '../../../entities/agency/agency.entity.service';
import { mockOaCertificateEntityService } from '../../../entities/oa-certificate/__mocks__/oa-certificate.entity.service.mock';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import {
  mockExpiredButNotRevokedOACertificate,
  mockIssuedOACertificate,
  mockRevokedOACertificate,
  TestOpenAttestationService,
} from '../__mocks__/open-attestation.service.mock';

describe('OpenAttestationService', () => {
  let service: TestOpenAttestationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestOpenAttestationService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: AgencyEntityService, useValue: mockAgencyEntityService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
      ],
    }).compile();

    service = module.get<TestOpenAttestationService>(TestOpenAttestationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyOaCertificateRevocationStatus', () => {
    it('should return the right revocation info when the document is not revoked', async () => {
      mockOaCertificateEntityService.retrieveOaCertificateWithFileAssetExpiry.mockResolvedValueOnce(mockIssuedOACertificate);

      expect(await service.verifyOaCertificateRevocationStatus('mock-certificate-id')).toEqual({
        revoked: false,
        documentHash: mockIssuedOACertificate.hash,
      });
    });

    it('should return the right revocation reasonCode when the document is revoked', async () => {
      mockOaCertificateEntityService.retrieveOaCertificateWithFileAssetExpiry.mockResolvedValueOnce(mockRevokedOACertificate);

      expect(await service.verifyOaCertificateRevocationStatus('mock-certificate-id')).toEqual({
        revoked: true,
        documentHash: mockRevokedOACertificate.hash,
        reasonCode: OaDocumentRevocationTypeMapper[mockRevokedOACertificate.revocationType!],
      });
    });

    it('should show the OA revoked when the file asset has expired by date but its status hasnt been updated to expired by cron', async () => {
      mockOaCertificateEntityService.retrieveOaCertificateWithFileAssetExpiry.mockResolvedValueOnce(mockExpiredButNotRevokedOACertificate);

      expect(await service.verifyOaCertificateRevocationStatus('mock-certificate-id')).toEqual({
        revoked: true,
        documentHash: mockExpiredButNotRevokedOACertificate.hash,
        reasonCode: OaDocumentRevocationTypeMapper['expired'],
      });
    });
  });

  describe('verifyIdentityProofLocation', () => {
    it('should call agencyService isAgencyExistByIdentityProofLocation with the right param', async () => {
      const mockLocation = 'some-location';
      const isAgencyExistByIdentityProofLocationSpy = jest.spyOn(mockAgencyEntityService, 'isAgencyExistByIdentityProofLocation');

      await service.verifyIdentityProofLocation(mockLocation);

      expect(isAgencyExistByIdentityProofLocationSpy).toBeCalledWith(mockLocation);
    });
  });

  describe('verifyOADocumentInBase64', () => {
    it('should call verifyOADocument with the right param', async () => {
      const mockOA = { document: 'fake-data' };
      const mockOABase64 = Buffer.from(JSON.stringify(mockOA)).toString('base64');

      const verifyOADocumentSpy = jest.spyOn(service, 'verifyOADocument');
      verifyOADocumentSpy.mockResolvedValueOnce({ isValid: true, fragments: [] });

      await service.verifyOADocumentInBase64(mockOABase64);

      expect(service.verifyOADocument).toBeCalledWith(mockOA);
    });

    it('should throw InvalidOaDocumentException when the decoded base64 content is not an valid object', async () => {
      const mockOABase64 = Buffer.from('{ 123: fake-data }lalala').toString('base64');

      await expect(service.verifyOADocumentInBase64(mockOABase64)).rejects.toThrowError(InvalidOaDocumentException);
    });
  });

  describe('verifyOADocument', () => {
    it('throw InvalidOaDocumentException when the document is not of valid OA schema', async () => {
      const validateSchemaSpy = jest.spyOn(OpenAttestation, 'validateSchema');
      validateSchemaSpy.mockReturnValueOnce(false);

      await expect(service.verifyOADocument({ document: 'invalid-oa-schema' } as any)).rejects.toThrowError(InvalidOaDocumentException);
    });

    it('should throw InvalidOaDocumentException when the issuer is empty', async () => {
      const validateSchemaSpy = jest.spyOn(OpenAttestation, 'validateSchema');
      validateSchemaSpy.mockReturnValueOnce(true);

      const getDataSpy = jest.spyOn(OpenAttestation, 'getData');
      getDataSpy.mockReturnValue({ issuers: [] });

      await expect(service.verifyOADocument({ document: 'invalid-oa-schema' } as any)).rejects.toThrowError(InvalidOaDocumentException);
    });

    it('should throw InvalidOaDocumentException when the issuer is not whitelisted domains', async () => {
      const validateSchemaSpy = jest.spyOn(OpenAttestation, 'validateSchema');
      validateSchemaSpy.mockReturnValueOnce(true);

      const getDataSpy = jest.spyOn(OpenAttestation, 'getData');
      getDataSpy.mockReturnValue({ issuers: [{ id: 'issuer-id-1', name: 'issuer-name-1' }] });

      await expect(service.verifyOADocument({ document: 'invalid-oa-schema' } as any)).rejects.toThrowError(InvalidOaDocumentException);
    });
  });
});
