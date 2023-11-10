import { MockRepository } from '../../../../typings/common.mock';
import { OaCertificateEntityRepository } from '../oa-certificate.entity.repository';
import { createMockOaCertificate } from './oa-certificate.mock';

export const mockOaCertificateEntityRepository: MockRepository<OaCertificateEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockOaCertificate(arg)),
    save: jest.fn().mockReturnThis(),
  }),
  findOaCertificateWithFileAssetExpiry: jest.fn(),
  updateOaCertificates: jest.fn(),
};
