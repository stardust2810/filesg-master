import { AgencySignedWrappedOaDocument, CertificateVerificationResponse, CirisRetrieveBiometricsApiResponse } from '@filesg/common';
import { OpenAttestationDocument, SignedWrappedDocument } from '@govtechsg/open-attestation/dist/types/2.0/types';

import { MockService } from '../../../../typings/common.mock';
import { AgencyClientV2Service } from '../agency-client.v2.service';

export class TestAgencyClientV2Service extends AgencyClientV2Service {
  public retrieveTokenFromCiris() {
    return super.retrieveTokenFromCiris();
  }
  public retrieveOaImageIdFromOaDocument(oaDocument: AgencySignedWrappedOaDocument) {
    return super.retrieveOaImageIdFromOaDocument(oaDocument);
  }
  public retrievePhotoFromCiris(token: string, oaImageId: string): Promise<CirisRetrieveBiometricsApiResponse> {
    return super.retrievePhotoFromCiris(token, oaImageId);
  }
}

export const mockAgencyClientV2Service: MockService<TestAgencyClientV2Service> = {
  retrievePhotoFromCiris: jest.fn(),
  retrieveUinFromMyIca: jest.fn(),
  retrieveUserInfoFromMcc: jest.fn(),
  retrieveTokenFromCiris: jest.fn(),
  retrieveOaImageIdFromOaDocument: jest.fn(),
  retrieveOaImage: jest.fn(),
  retrieveImageFromApex: jest.fn(),
};

// =============================================================================
// Mock data
// =============================================================================
export const mockOaDocument = {} as SignedWrappedDocument<OpenAttestationDocument>;

export const mockVerificationResult = {
  isValid: true,
} as CertificateVerificationResponse;

export const mockVerifyOADocumentInBase64Response = {
  oaDocument: mockOaDocument,
  verificationResult: mockVerificationResult,
};

export const mockCirisRetrieveBiometricsApiResponse: CirisRetrieveBiometricsApiResponse = {
  registrationInfoDtoList: [
    {
      faces: [
        {
          mugshot: { image: 'mockImage', imageFormat: 'mockImageFormat', recordId: 'mockRecordId' },
          thumbnail: { image: 'mockImage', imageFormat: 'mockImageFormat', recordId: 'mockRecordId' },
        },
      ],
    },
  ],
};

export const mockInvalidVerificationResult = {
  isValid: false,
  fragments: []
} as CertificateVerificationResponse;

export const mockInvalidVerifyOADocumentInBase64Response = {
  oaDocument: mockOaDocument,
  verificationResult: mockInvalidVerificationResult,
};

export const mockCirisRetrieveBiometricsApiResponseWithErrors: CirisRetrieveBiometricsApiResponse = {
  registrationInfoDtoList: [],
  errors: ['mockErrors'],
};

export const mockCirisRetrieveBiometricsApiResponseWithoutRegistrationInfoDtoList = {} as CirisRetrieveBiometricsApiResponse;

export const mockCirisRetrieveBiometricsApiResponseWithEmptyRegistrationInfoDtoList: CirisRetrieveBiometricsApiResponse = {
  registrationInfoDtoList: [],
};

export const mockCirisRetrieveBiometricsApiResponseWithEmptyBioRestFaceInfoDto: CirisRetrieveBiometricsApiResponse = {
  registrationInfoDtoList: [
    {
      faces: [],
    },
  ],
};

export const mockCirisRetrieveBiometricsApiResponseWithEmptyMugshotAndThumbnail = {
  registrationInfoDtoList: [
    {
      faces: [
        {
          mugshot: {},
          thumbnail: {},
        },
      ],
    },
  ],
} as CirisRetrieveBiometricsApiResponse;
