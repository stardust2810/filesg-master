import { FILE_STATUS, FILE_TYPE, OA_CERTIFICATE_STATUS, REVOCATION_TYPE, STATUS } from '@filesg/common';
import { Issuer } from '@govtechsg/open-attestation/dist/types/__generated__/schema.2.0';

import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockOaCertificate } from '../../../entities/oa-certificate/__mocks__/oa-certificate.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { OpenAttestationService } from '../open-attestation.service';

export class TestOpenAttestationService extends OpenAttestationService {
  public async isIssuerValid(issuer: Issuer) {
    return super.isIssuerValid(issuer);
  }
}

export const mockOpenAttestationService: MockService<TestOpenAttestationService> = {
  onApplicationBootstrap: jest.fn(),
  verifyOaCertificateRevocationStatus: jest.fn(),
  verifyIdentityProofLocation: jest.fn(),
  verifyOADocument: jest.fn(),
  verifyOADocumentInBase64: jest.fn(),
  isIssuerValid: jest.fn(),
};

export const certificateId = 'mock-certificate-1';
export const certificateHash = 'mock-certificate-hash-1';

const mockUser = createMockCitizenUser({
  name: 'Jason Bourne',
  uuid: `mock-user-01`,
  uin: 'S111111F',
  email: 'jason@mockcom',
  status: STATUS.ACTIVE,
});

const mockActiveFileAsset = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-1',
  name: 'mockFile1',
  documentType: FILE_TYPE.JPEG,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  size: 123,
  status: FILE_STATUS.ACTIVE,
  metadata: {},
  oaCertificate: null,
});

const mockRevokedFileAsset = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-1',
  name: 'mockFile1',
  documentType: FILE_TYPE.JPEG,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  size: 123,
  status: FILE_STATUS.REVOKED,
  metadata: {},
  oaCertificate: null,
});

const date = new Date();
date.setDate(date.getDate() - 1);

const mockExpiredByDateFileAsset = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-1',
  name: 'mockFile1',
  documentType: FILE_TYPE.JPEG,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  size: 123,
  status: FILE_STATUS.ACTIVE,
  metadata: {},
  oaCertificate: null,
  expireAt: date,
});

export const mockIssuedOACertificate = createMockOaCertificate({
  id: certificateId,
  hash: certificateHash,
  revokedBy: mockUser,
  fileAssets: [mockActiveFileAsset],
  status: OA_CERTIFICATE_STATUS.ISSUED,
});

export const mockRevokedOACertificate = createMockOaCertificate({
  id: certificateId,
  hash: certificateHash,
  revocationType: REVOCATION_TYPE.CANCELLED,
  revokedBy: mockUser,
  fileAssets: [mockRevokedFileAsset],
  status: OA_CERTIFICATE_STATUS.REVOKED,
});

export const mockExpiredButNotRevokedOACertificate = createMockOaCertificate({
  id: certificateId,
  hash: certificateHash,
  fileAssets: [mockExpiredByDateFileAsset],
  status: OA_CERTIFICATE_STATUS.ISSUED,
});
