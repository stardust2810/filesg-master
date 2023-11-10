/* eslint-disable sonarjs/no-duplicate-string */
import { maskUin } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  CirisPhotoException,
  CirisPhotoOaInvalidException,
  CirisResponseEmptyException,
  MccApiException,
} from '../../../../common/filters/custom-exceptions.filter';
import { APEX_INT_CLIENT_PROVIDER, MCC_API_CLIENT_PROVIDER, MYICA_CLIENT_PROVIDER } from '../../../../consts';
import { MY_ICA_DO_LOGIN_RESPONSE_STATUS } from '../../../../dtos/agency-client/response';
import { MCC_STATUS_CODE } from '../../../../typings/common';
import {
  mockApexClientProvider,
  mockMccApiClientProvider,
  mockMyIcaClientProvider,
} from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockOpenAttestationService } from '../../open-attestation/__mocks__/open-attestation.service.mock';
import { OpenAttestationService } from '../../open-attestation/open-attestation.service';
import {
  mockCirisRetrieveBiometricsApiResponse,
  mockCirisRetrieveBiometricsApiResponseWithEmptyBioRestFaceInfoDto,
  mockCirisRetrieveBiometricsApiResponseWithEmptyMugshotAndThumbnail,
  mockCirisRetrieveBiometricsApiResponseWithEmptyRegistrationInfoDtoList,
  mockCirisRetrieveBiometricsApiResponseWithErrors,
  mockCirisRetrieveBiometricsApiResponseWithoutRegistrationInfoDtoList,
  mockInvalidVerifyOADocumentInBase64Response,
  mockOaDocument,
  mockVerifyOADocumentInBase64Response,
  TestAgencyClientV2Service,
} from '../__mocks__/agency-client.v2.service.mock';

describe('AgencyClientV2Service', () => {
  let service: TestAgencyClientV2Service;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestAgencyClientV2Service,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: OpenAttestationService, useValue: mockOpenAttestationService },
        { provide: MYICA_CLIENT_PROVIDER, useValue: mockMyIcaClientProvider },
        { provide: MCC_API_CLIENT_PROVIDER, useValue: mockMccApiClientProvider },
        { provide: APEX_INT_CLIENT_PROVIDER, useValue: mockApexClientProvider },
      ],
    }).compile();

    service = module.get<TestAgencyClientV2Service>(TestAgencyClientV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('retrieveOaImage', () => {
    const mockOaBase64 = 'mockOaBase64';
    const mockOaImageId = 'mockOaImageId';
    const mockToken = 'mockToken';

    let retrieveOaImageIdFromOaDocumentSpy: jest.SpyInstance;
    let retrieveTokenFromCirisSpy: jest.SpyInstance;
    let retrievePhotoFromCirisSpy: jest.SpyInstance;

    beforeAll(() => {
      // Spies
      retrieveOaImageIdFromOaDocumentSpy = jest.spyOn(service, 'retrieveOaImageIdFromOaDocument');
      retrieveTokenFromCirisSpy = jest.spyOn(service, 'retrieveTokenFromCiris');
      retrievePhotoFromCirisSpy = jest.spyOn(service, 'retrievePhotoFromCiris');

      // Mocks
      mockOpenAttestationService.verifyOADocumentInBase64.mockResolvedValue(mockVerifyOADocumentInBase64Response);
      retrieveOaImageIdFromOaDocumentSpy.mockReturnValue({ oaImageId: mockOaImageId });
      retrieveTokenFromCirisSpy.mockResolvedValue({ token: mockToken });
    });

    it('should be defined', () => {
      expect(service.retrieveOaImage).toBeDefined();
    });

    it('should make a post call with the correct path and data', async () => {
      // Spies

      // mock return
      retrievePhotoFromCirisSpy.mockResolvedValueOnce(mockCirisRetrieveBiometricsApiResponse);

      // expect
      await service.retrieveOaImage(mockOaBase64);

      expect(mockOpenAttestationService.verifyOADocumentInBase64).toBeCalledWith(mockOaBase64);
      expect(retrieveOaImageIdFromOaDocumentSpy).toBeCalledWith(mockOaDocument);
      expect(retrieveTokenFromCirisSpy).toBeCalledTimes(1);
      expect(retrievePhotoFromCirisSpy).toBeCalledWith(mockToken, mockOaImageId);
    });

    it('should throw exception if verification result is not valid', async () => {
      mockOpenAttestationService.verifyOADocumentInBase64.mockResolvedValueOnce(mockInvalidVerifyOADocumentInBase64Response);

      await expect(service.retrieveOaImage(mockOaBase64)).rejects.toThrow(
        new CirisPhotoOaInvalidException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE),
      );
    });

    it('should throw exception if no oaImageId is present', async () => {
      retrieveOaImageIdFromOaDocumentSpy.mockReturnValueOnce({ oaImageId: undefined });

      await expect(service.retrieveOaImage(mockOaBase64)).rejects.toThrow(
        new CirisPhotoOaInvalidException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE),
      );
    });

    it('should throw exception if errors are returned from retrievePhotoFromCiris', async () => {
      retrievePhotoFromCirisSpy.mockResolvedValueOnce(mockCirisRetrieveBiometricsApiResponseWithErrors);

      await expect(service.retrieveOaImage(mockOaBase64)).rejects.toThrow(
        new CirisPhotoException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `No photo retrieved for ${maskUin(mockOaImageId)}`),
      );
    });

    it('should throw exception if registrationInfoDtoList is missing or an empty array', async () => {
      retrievePhotoFromCirisSpy.mockResolvedValueOnce(mockCirisRetrieveBiometricsApiResponseWithoutRegistrationInfoDtoList);

      await expect(service.retrieveOaImage(mockOaBase64)).rejects.toThrow(
        new CirisResponseEmptyException(
          COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
          `Empty body. No photo retrieved for ${maskUin(mockOaImageId)}`,
        ),
      );

      retrievePhotoFromCirisSpy.mockResolvedValueOnce(mockCirisRetrieveBiometricsApiResponseWithEmptyRegistrationInfoDtoList);

      await expect(service.retrieveOaImage(mockOaBase64)).rejects.toThrow(
        new CirisResponseEmptyException(
          COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
          `Empty body. No photo retrieved for ${maskUin(mockOaImageId)}`,
        ),
      );
    });

    it('should throw exception if faces array is empty', async () => {
      retrievePhotoFromCirisSpy.mockResolvedValueOnce(mockCirisRetrieveBiometricsApiResponseWithEmptyBioRestFaceInfoDto);

      await expect(service.retrieveOaImage(mockOaBase64)).rejects.toThrow(
        new CirisResponseEmptyException(
          COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
          `Received empty for faces. No photo retrieved for ${maskUin(mockOaImageId)}`,
        ),
      );
    });

    it('should throw exception if mugshot and thumbnail are empty', async () => {
      retrievePhotoFromCirisSpy.mockResolvedValueOnce(mockCirisRetrieveBiometricsApiResponseWithEmptyMugshotAndThumbnail);

      await expect(service.retrieveOaImage(mockOaBase64)).rejects.toThrow(
        new CirisPhotoException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `No photo retrieved for ${maskUin(mockOaImageId)}`),
      );
    });
  });

  describe('retrieveUinFromMyIca', () => {
    it('should be defined', () => {
      expect(service.retrieveUinFromMyIca).toBeDefined();
    });

    it('should make a post call with the correct path and data', async () => {
      // mock data
      const mockToken = 'test';
      const mockSingpassId = 'testId';

      // mock response
      mockMyIcaClientProvider.post.mockResolvedValue({
        data: {
          header: {
            singpassID: mockSingpassId,
          },
          status: MY_ICA_DO_LOGIN_RESPONSE_STATUS.AUTHENTICATED,
        },
      });

      // expect
      expect(await service.retrieveUinFromMyIca(mockToken));
      expect(mockMyIcaClientProvider.post).toBeCalledWith('/', {
        token: mockToken,
        header: null,
        scheme: null,
        status: null,
        bundle: null,
      });
    });
  });

  describe('retrieveUserInfoFromMcc', () => {
    it('should be defined', () => {
      expect(service.retrieveUserInfoFromMcc).toBeDefined();
    });

    it('should make a post call with the correct path and data', async () => {
      // mock data
      const mockUin = 'test';

      // mock response
      mockMccApiClientProvider.post.mockResolvedValue({
        data: {
          retrievalStatus: MCC_STATUS_CODE['MYINFO RETRIEVAL SUCCESSFUL'],
          contactInfo: 'test',
        },
      });

      // expect
      expect(await service.retrieveUserInfoFromMcc(mockUin));
      expect(mockMccApiClientProvider.post).toBeCalledWith('/', {
        uin: mockUin,
        eSvcID: 'filesg',
        infoSrc: '3',
      });
    });

    it('should throw MccApiExceoption with warn log level for status EM02', async () => {
      // mock data
      const mockUin = 'test';

      // mock response
      mockMccApiClientProvider.post.mockResolvedValue({
        data: {
          retrievalStatus: MCC_STATUS_CODE['PERSON HAS INCOMPLETE PROFILE'],
          contactInfo: 'test',
        },
      });

      try {
        await service.retrieveUserInfoFromMcc(mockUin);
      } catch (error) {
        expect(error instanceof MccApiException).toBeTruthy();
        expect((error as MccApiException).errorLogLevel).toBe('warn');
      }
    });

    it('should throw MccApiExceoption with error log level for status EM01', async () => {
      // mock data
      const mockUin = 'test';

      // mock response
      mockMccApiClientProvider.post.mockResolvedValue({
        data: {
          retrievalStatus: MCC_STATUS_CODE['INVALID UIN LENGTH'],
          contactInfo: 'test',
        },
      });

      try {
        await service.retrieveUserInfoFromMcc(mockUin);
      } catch (error) {
        expect(error instanceof MccApiException).toBeTruthy();
        expect((error as MccApiException).errorLogLevel).toBe('error');
      }
    });
  });

  describe('retrieveTokenFromCiris', () => {
    it('should be defined', async () => {
      expect(service.retrieveTokenFromCiris).toBeDefined();
    });
  });

  describe('retrievePhotoFromCiris', () => {
    it('should be defined', async () => {
      expect(service.retrievePhotoFromCiris).toBeDefined();
    });
  });

  describe('retrieveOaImageIdFromOaDocument', () => {
    it('should be defined', async () => {
      expect(service.retrieveOaImageIdFromOaDocument).toBeDefined();
    });
  });
});
