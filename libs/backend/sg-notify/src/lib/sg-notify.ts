import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { validate } from 'class-validator';
import { compactDecrypt, CompactEncrypt, createRemoteJWKSet, importJWK, JWTPayload, jwtVerify, SignJWT } from 'jose';

import {
  AUTHZ_TOKEN,
  CONTENT_TYPE,
  ENCRYPTION_ALGORITHM,
  ENCRYPTION_METHOD,
  GET_NOTIFICATION_MULTIPLE_STATUS,
  GET_NOTIFICATION_STATUS,
  JWK_USE_ENC,
  JWT_EXPIRY,
  ONE_SEC_IN_MILLISECONDS,
  REQUEST_TIMEOUT,
  SEND_MULTIPLE_NOTIFICATION_REQUEST,
  SEND_NOTIFICATION_REQUEST,
  SgNotifyRequestException,
  ValidationException,
} from './sg-notify.common';
import {
  AlgoritmTypes,
  AuthzTokenErrorResponse,
  AuthzTokenJWT,
  AuthzTokenSuccessResponse,
  JWKS,
  Key,
  MultipleNotificationRequestBody,
  MultipleNotificationRequestSucessResponse,
  MultipleNotificationStatusRequestBody,
  MultipleNotificationStatusRequestSucessResponse,
  NotificationRequestBody,
  NotificationRequestDetails,
  NotificationRequestSucessResponse,
  NotificationStatusResponse,
  SgNotifyConstructor,
} from './sg-notify.typing';

export class SgNotify {
  private readonly client_id: string;
  private readonly client_secret: string;
  private readonly apiEndpoint: string;
  private readonly jwksEndpoint: string;
  private readonly jwsPrivateKey: Key;
  private readonly jwePrivateKey: Key;
  private readonly keyAlgoritm: AlgoritmTypes;
  private readonly axiosClient: AxiosInstance;
  private accessToken: AuthzTokenSuccessResponse;

  constructor(props: SgNotifyConstructor) {
    this.client_id = props.client_id;
    this.client_secret = props.client_secret;
    this.apiEndpoint = props.apiEndpoint;
    this.jwksEndpoint = props.jwksEndpoint;
    this.jwsPrivateKey = props.jwsPrivateKey;
    this.jwePrivateKey = props.jwePrivateKey;
    this.keyAlgoritm = props.keyAlgoritm;

    this.axiosClient = axios.create({
      timeout: REQUEST_TIMEOUT,
      baseURL: this.apiEndpoint,
    });

    this.axiosClient.interceptors.request.use(this.axiosRequestInterceptors.bind(this));
    this.axiosClient.interceptors.response.use(this.axiosResponseInterceptors.bind(this));
  }

  //==========================================
  // Public function
  //==========================================
  public get SgNotifyAxiosClient() {
    return this.axiosClient;
  }

  public async sendNotification(notification: NotificationRequestDetails): Promise<NotificationRequestSucessResponse> {
    await this.validateSendNotificationRequest(notification);

    const sendNotificationReqBody: NotificationRequestBody = {
      notification_req: notification,
    };

    return await this.makeRequest({
      method: 'POST',
      url: SEND_NOTIFICATION_REQUEST,
      data: sendNotificationReqBody,
    });
  }

  public async sendBatchNotification(notifications: NotificationRequestDetails[]): Promise<MultipleNotificationRequestSucessResponse> {
    for (let x = 0; x < notifications.length; x++) {
      await this.validateSendNotificationRequest(notifications[x]);
    }

    const multipleNotificationRequestBody: MultipleNotificationRequestBody = {
      notification_requests: notifications,
    };

    return await this.makeRequest({
      method: 'POST',
      url: SEND_MULTIPLE_NOTIFICATION_REQUEST,
      data: multipleNotificationRequestBody,
    });
  }

  public async getNotificationStatus(request_id: string): Promise<NotificationStatusResponse> {
    return await this.makeRequest({
      method: 'GET',
      url: `${GET_NOTIFICATION_STATUS}/${request_id}`,
    });
  }

  public async getMultipleNotificationStatus(requestIds: string[]): Promise<MultipleNotificationStatusRequestSucessResponse> {
    const multipleNotificationStatusReqBody: MultipleNotificationStatusRequestBody = {
      ntf_status: { ntf_request_ids: requestIds },
    };

    return await this.makeRequest({
      method: 'POST',
      url: GET_NOTIFICATION_MULTIPLE_STATUS,
      data: multipleNotificationStatusReqBody,
    });
  }

  //==========================================
  // Private function
  //==========================================
  private async getAuthzToken(): Promise<AuthzTokenSuccessResponse> {
    if (this.accessToken && this.accessToken.exp * ONE_SEC_IN_MILLISECONDS > new Date().getTime()) {
      return this.accessToken;
    }

    const authPayload: AuthzTokenJWT = {
      client_id: this.client_id,
      client_secret: this.client_secret,
      grant_type: 'CLIENT_CREDENTIALS',
    };

    const encryptedJWT = await this.signAndEncryptPayLoad(authPayload);
    this.accessToken = await this.makeRequest({
      method: 'POST',
      url: AUTHZ_TOKEN,
      headers: { Authorization: `Bearer ${encryptedJWT}` },
    });

    return this.accessToken;
  }

  private async getSGNotifyJWKS(): Promise<JWKS> {
    try {
      const jwksRes = await axios.get<JWKS>(this.jwksEndpoint);
      return jwksRes.data;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const axiosError = err;
        throw new Error(`[${axiosError.code}] Failed to fetch JWKS from ${this.jwksEndpoint}. ${axiosError.message}`);
      }
      throw new Error(err);
    }
  }

  private async validateSendNotificationRequest(notification: NotificationRequestDetails) {
    const notificationReqToValidate = new NotificationRequestDetails();
    Object.assign(notificationReqToValidate, notification);
    const validationErrors = await validate(notificationReqToValidate);
    if (validationErrors.length > 0) {
      throw new ValidationException('NotificationRequestDetails', validationErrors);
    }
  }

  private throwError(err: any, errName: string): never {
    if (axios.isAxiosError(err)) {
      const authzErrResponse = (err as AxiosError).response?.data as AuthzTokenErrorResponse;
      throw new SgNotifyRequestException(errName, authzErrResponse);
    }
    throw err;
  }

  private async signAndEncryptPayLoad(payload: JWTPayload): Promise<string> {
    const privateSigKey = await importJWK(this.jwsPrivateKey.key, this.jwsPrivateKey.alg);
    const signedJWT = await new SignJWT(payload)
      .setProtectedHeader({ alg: this.keyAlgoritm, cty: CONTENT_TYPE, kid: this.jwsPrivateKey.key.kid })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(privateSigKey);

    const jwks = await this.getSGNotifyJWKS();
    const encKey = jwks.keys.find((x) => x.use === JWK_USE_ENC);
    if (!encKey) {
      throw new Error(`Missing encryption public key under url ${this.jwksEndpoint}`);
    }
    const recipientEncPublicKey = await importJWK(encKey, encKey.alg);
    return await new CompactEncrypt(new TextEncoder().encode(signedJWT))
      .setProtectedHeader({ alg: ENCRYPTION_ALGORITHM, enc: ENCRYPTION_METHOD, cty: CONTENT_TYPE, kid: encKey.kid })
      .encrypt(recipientEncPublicKey);
  }

  private async decryptAndVerifyJWE(jwe: string) {
    const privateEncKey = await importJWK(this.jwePrivateKey.key, this.jwePrivateKey.alg);
    const { plaintext } = await compactDecrypt(jwe, privateEncKey);

    const sgNotifyJWKS = createRemoteJWKSet(new URL(this.jwksEndpoint));
    const { payload } = await jwtVerify(plaintext, sgNotifyJWKS);
    return payload;
  }

  private async axiosRequestInterceptors(requestConfig: AxiosRequestConfig) {
    if (requestConfig.url === AUTHZ_TOKEN) {
      return requestConfig;
    }

    const { access_token, token_type } = await this.getAuthzToken();
    requestConfig.headers = { Authorization: `${token_type} ${access_token}` };

    if (requestConfig.data) {
      requestConfig.data = await this.signAndEncryptPayLoad(requestConfig.data);
    }
    requestConfig.headers['content-type'] = 'application/json';
    return requestConfig;
  }

  private async axiosResponseInterceptors(response: AxiosResponse<any, any>) {
    const dataToDecryptAndVerify = response.config.url === AUTHZ_TOKEN ? response.data.token : response.data.jwe;
    response.data = await this.decryptAndVerifyJWE(dataToDecryptAndVerify);
    return response;
  }

  private async makeRequest(requestConfig: AxiosRequestConfig) {
    try {
      const response = await this.axiosClient.request(requestConfig);
      return response.data;
    } catch (err) {
      this.throwError(err, `(${requestConfig.method}) ${requestConfig.url}`);
    }
  }
}
