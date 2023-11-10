import { maskUin } from '@filesg/backend-common';
import {
  AgencyClientPhotoResponse,
  AgencySignedWrappedOaDocument,
  CirisRetrieveBiometricsApiRequest,
  CirisRetrieveBiometricsApiResponse,
  CirisRetrieveJwtRequest,
  CirisRetrieveJwtResponse,
  COMPONENT_ERROR_CODE,
} from '@filesg/common';
import { ErrorVerificationFragment, InvalidVerificationFragment } from '@govtechsg/oa-verify';
import { getData } from '@govtechsg/open-attestation';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';

import {
  CirisPhotoException,
  CirisPhotoOaInvalidException,
  CirisResponseEmptyException,
  CirisTokenRetrievalException,
  MccApiException,
  MyIcaDologinException,
} from '../../../common/filters/custom-exceptions.filter';
import { APEX_INT_CLIENT_PROVIDER, MCC_API_CLIENT_PROVIDER, MYICA_CLIENT_PROVIDER } from '../../../consts';
import { MccApiRequest, MyIcaDoLoginRequest } from '../../../dtos/agency-client/request';
import { MccApiResponse, MY_ICA_DO_LOGIN_RESPONSE_STATUS, MyIcaDologinResponse } from '../../../dtos/agency-client/response';
import { MCC_STATUS_CODE } from '../../../typings/common';
import { oaImageIdEncryptionTransformer } from '../../../utils/encryption';
import { FileSGConfigService } from '../../setups/config/config.service';
import { OpenAttestationService } from '../open-attestation/open-attestation.service';

@Injectable()
export class AgencyClientV2Service {
  private readonly logger = new Logger(AgencyClientV2Service.name);

  constructor(
    @Inject(APEX_INT_CLIENT_PROVIDER) private readonly apexIntranetClient: AxiosInstance,
    @Inject(MYICA_CLIENT_PROVIDER) private readonly myIcaClient: AxiosInstance,
    @Inject(MCC_API_CLIENT_PROVIDER) private readonly mccApiClient: AxiosInstance,
    private readonly oaService: OpenAttestationService,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  // ===========================================================================
  // Public
  // ===========================================================================
  public async retrieveOaImage(oaDocumentInBase64: string): Promise<AgencyClientPhotoResponse> {
    this.logger.log('Verifying OA');

    const { oaDocument, verificationResult } = await this.oaService.verifyOADocumentInBase64(oaDocumentInBase64);

    if (!verificationResult.isValid) {
      const invalidVerificationDetails = verificationResult.fragments.reduce<string[]>((array, fragment) => {
        if (fragment.status === 'INVALID' || fragment.status === 'ERROR') {
          const { name, type, reason } = fragment as InvalidVerificationFragment<unknown> | ErrorVerificationFragment<unknown>;
          array.push(`[${type}]${name}: ${reason.message}`);
        }

        return array;
      }, []);

      this.logger.error(`OA verification error: ${invalidVerificationDetails.join(', ')}`);
      throw new CirisPhotoOaInvalidException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE);
    }
    this.logger.log('[Succeed] Calling verify OA in retrieve image');

    const { oaImageId } = this.retrieveOaImageIdFromOaDocument(oaDocument as AgencySignedWrappedOaDocument);

    if (!oaImageId) {
      throw new CirisPhotoOaInvalidException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, 'No oaImageId present');
    }

    // Get token
    this.logger.log('[Ciris - MMBS Photo Retrival] Request to get Token');
    const { token } = await this.retrieveTokenFromCiris();

    // Get photo
    this.logger.log('[Ciris - MMBS Photo Retrival] Request to get Photo');
    const { registrationInfoDtoList, errors } = await this.retrievePhotoFromCiris(token, oaImageId);

    if (errors) {
      const internalLog = `Errors: ${JSON.stringify(errors)}`;
      throw new CirisPhotoException(
        COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
        `No photo retrieved for ${maskUin(oaImageId)}`,
        internalLog,
      );
    }

    if (!registrationInfoDtoList || registrationInfoDtoList.length === 0) {
      throw new CirisResponseEmptyException(
        COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
        `Empty body. No photo retrieved for ${maskUin(oaImageId)}`,
      );
    }

    if (registrationInfoDtoList[0].faces.length === 0) {
      throw new CirisResponseEmptyException(
        COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
        `Received empty for faces. No photo retrieved for ${maskUin(oaImageId)}`,
      );
    }

    const { mugshot, thumbnail } = registrationInfoDtoList[0].faces[0];

    if (mugshot && mugshot.image) {
      return { photo: mugshot.image };
    }

    if (thumbnail && thumbnail.image) {
      this.logger.error(`[Ciris - MMBS Photo Retrival] Mugshot object was empty thus return thumbnail`);
      return { photo: thumbnail.image };
    }

    throw new CirisPhotoException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `No photo retrieved for ${maskUin(oaImageId)}`);
  }

  // TODO: remove after testing
  public async retrieveImageFromApex(uin: string): Promise<AgencyClientPhotoResponse> {
    // Get token
    this.logger.log('[Ciris - MMBS Photo Retrival] Request to get Token');
    const { token } = await this.retrieveTokenFromCiris();

    // Get photo
    this.logger.log('[Ciris - MMBS Photo Retrival] Request to get Photo');
    const { registrationInfoDtoList, errors } = await this.retrievePhotoFromCiris(token, uin);

    if (errors) {
      const internalLog = `Errors: ${JSON.stringify(errors)}`;
      throw new CirisPhotoException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `No photo retrieved for ${maskUin(uin)}`, internalLog);
    }

    if (!registrationInfoDtoList || registrationInfoDtoList.length === 0) {
      throw new CirisResponseEmptyException(
        COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
        `Empty body. No photo retrieved for ${maskUin(uin)}`,
      );
    }

    if (registrationInfoDtoList[0].faces.length === 0) {
      throw new CirisResponseEmptyException(
        COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
        `Received empty for faces. No photo retrieved for ${maskUin(uin)}`,
      );
    }

    const { mugshot, thumbnail } = registrationInfoDtoList[0].faces[0];

    if (mugshot && mugshot.image) {
      return { photo: mugshot.image };
    }

    if (thumbnail && thumbnail.image) {
      this.logger.error(`[Ciris - MMBS Photo Retrival] Mugshot object was empty thus return thumbnail`);
      return { photo: thumbnail.image };
    }

    throw new CirisPhotoException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `No photo retrieved for ${maskUin(uin)}`);
  }

  //FIXME: MSW mocked
  public async retrieveUinFromMyIca(token: string) {
    try {
      const response = await this.myIcaClient.post<MyIcaDologinResponse, AxiosResponse<MyIcaDologinResponse>, MyIcaDoLoginRequest>('/', {
        token,
        header: null,
        scheme: null,
        status: null,
        bundle: null,
      });

      const { header, status } = response.data;

      if (status === MY_ICA_DO_LOGIN_RESPONSE_STATUS.NOT_AUTHENTICATED) {
        throw new MyIcaDologinException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `Unable to retrieve token, or token expired`);
      }

      if (!header || !header.singpassID) {
        throw new MyIcaDologinException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `Missing singpassID`);
      }

      return header.singpassID;
    } catch (error) {
      throw new MyIcaDologinException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `${error}`);
    }
  }

  //FIXME: MSW mocked
  public async retrieveUserInfoFromMcc(uin: string): Promise<MccApiResponse> {
    this.logger.log(`Querying MCC to get MyInfo for user ${maskUin(uin)}`);
    try {
      const response = await this.mccApiClient.post<MccApiResponse, AxiosResponse<MccApiResponse>, MccApiRequest>('/', {
        uin,
        eSvcID: 'filesg',
        infoSrc: '3',
      });

      if (response.data.retrievalStatus !== MCC_STATUS_CODE['MYINFO RETRIEVAL SUCCESSFUL']) {
        const errorMsg = Object.keys(MCC_STATUS_CODE).find(
          (key) => MCC_STATUS_CODE[key as keyof typeof MCC_STATUS_CODE] === response.data.retrievalStatus,
        );

        const codesThatCanBeDowngradedToWarn = ['EM02', 'EM05'];
        const isDowngradedToWarn = codesThatCanBeDowngradedToWarn.includes(response.data.retrievalStatus);

        throw new MccApiException(
          COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE,
          `[${response.data.retrievalStatus}]: ${errorMsg}`,
          isDowngradedToWarn,
        );
      }

      return response.data;
    } catch (error) {
      let isWarnLogLevel = false;
      if (error instanceof MccApiException) {
        isWarnLogLevel = error.errorLogLevel === 'warn';
      }
      throw new MccApiException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `${error}`, isWarnLogLevel);
    }
  }

  // ===========================================================================
  // Protected
  // ===========================================================================
  protected async retrieveTokenFromCiris(): Promise<CirisRetrieveJwtResponse> {
    const tokenEndpoint = '/ica/ica/PostmanSvc/mmbs/webservice/services/biometrics/authenticate';
    const { cirisMmbsSystemId, cirisMmbsSystemPw } = this.fileSGConfigService.agencyConfig;

    const systemCredentials = { systemId: cirisMmbsSystemId, systemPw: cirisMmbsSystemPw };

    try {
      const response = await this.apexIntranetClient.post<
        CirisRetrieveJwtResponse,
        AxiosResponse<CirisRetrieveJwtResponse>,
        CirisRetrieveJwtRequest
      >(tokenEndpoint, systemCredentials);

      return response.data;
    } catch (error) {
      throw new CirisTokenRetrievalException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, JSON.stringify(error));
    }
  }

  protected async retrievePhotoFromCiris(token: string, oaImageId: string): Promise<CirisRetrieveBiometricsApiResponse> {
    const photoEndpoint = '/ica/ica/PostmanSvc/mmbs/webservice/services/biometrics/getLatestRegistrationListJSAction';
    try {
      const response = await this.apexIntranetClient.post<
        CirisRetrieveBiometricsApiResponse,
        AxiosResponse<CirisRetrieveBiometricsApiResponse>,
        CirisRetrieveBiometricsApiRequest
      >(photoEndpoint, {
        token,
        datasourceList: ['VPASS'],
        recordCount: 1,
        registrationFilter: {
          includeFaces: true,
          registrationKey: {
            applicationRefNo: null,
            majorRefNo: null,
            minorRefNo: null,
            registrationId: null,
          },
          registrationInfoDto: {
            secondaryExternalId: oaImageId,
          },
        },
      });
      return response.data;
    } catch (error) {
      throw new CirisPhotoException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE, `${error}`);
    }
  }

  protected retrieveOaImageIdFromOaDocument(oaDocument: AgencySignedWrappedOaDocument): { oaImageId: string | undefined } {
    const { agencyData } = getData(oaDocument);
    const { photoId } = agencyData;

    if (!photoId) {
      throw new CirisPhotoOaInvalidException(COMPONENT_ERROR_CODE.AGENCY_CLIENT_SERVICE);
    }

    const oaImageId = oaImageIdEncryptionTransformer.from(photoId);
    return { oaImageId };
  }
}
