import { OA_CERTIFICATE_STATUS } from '@filesg/common';

import { OaCertificateCreationModel } from '../../../../entities/oa-certificate';
import { MockService } from '../../../../typings/common.mock';
import { OaCertificateEntityService } from '../oa-certificate.entity.service';
import { createMockOaCertificate } from './oa-certificate.mock';

export const mockOaCertificateEntityService: MockService<OaCertificateEntityService> = {
  buildOaCertificate: jest.fn(),
  saveOaCertificates: jest.fn(),
  saveOaCertificate: jest.fn(),
  retrieveOaCertificateWithFileAssetExpiry: jest.fn(),
  updateOaCertificates: jest.fn(),
};

export const mockOaCertificateUuid = 'mockOaCertificate-uuid-1';
export const mockOaCertificateUuid2 = 'mockOaCertificate-uuid-2';

export const mockOaCertificateModels: OaCertificateCreationModel[] = [
  { id: 'oaCert-1', hash: 'oaCert-1-hash', status: OA_CERTIFICATE_STATUS.ISSUED },
  { id: 'oaCert-1', hash: 'oaCert-1-hash', status: OA_CERTIFICATE_STATUS.REVOKED },
];

export const mockOaCertificate = createMockOaCertificate({
  id: 'oaCert-1',
  hash: 'oaCert-1-hash',
  status: OA_CERTIFICATE_STATUS.ISSUED,
});

export const mockOaCertificate2 = createMockOaCertificate({
  id: 'oaCert-1',
  hash: 'oaCert-1-hash',
  status: OA_CERTIFICATE_STATUS.REVOKED,
});

export const mockFileAssetHistories = [mockOaCertificate, mockOaCertificate2];
