import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { JWK, JWTPayload } from 'jose';

import { JWK_USE_ENC, JWK_USE_SIG } from './sg-notify.common';

export type AlgoritmTypes = 'ES256' | 'ES384' | 'ES512' | 'ES256K';

export interface SgNotifyConstructor {
  client_id: string; // client id provided during onboarding
  client_secret: string; // client secret provided during onboarding
  apiEndpoint: string; // sg notify api endpoint
  jwksEndpoint: string; // url endpoint to get the sg notify public key
  jwsPrivateKey: Key; //private key to sign request
  jwePrivateKey: Key; //private key to decrypt response
  keyAlgoritm: AlgoritmTypes;
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

export interface JWKS {
  keys: JWK[];
}

export interface Key {
  key: JWK;
  alg: AlgoritmTypes;
}

export interface JWKMap {
  [JWK_USE_SIG]: JWK;
  [JWK_USE_ENC]: JWK;
}
//=========================================
// SG-Notify Error Response
//=========================================
enum SgNotifyError {
  ARGUMENTS_NOT_VALID = 400,
  UNAUTHORIZED_USER = 401,
  USER_NOT_FOUND = 404,
  MOBILE_NUMBER_NOT_FOUND = 404,
  SERVER_SIDE_ERROR = 500,
}

export interface SgNotifyErrorResponse {
  id: string;
  error: keyof typeof SgNotifyError;
  error_description: string;
  trace_id: string;
}

//=========================================
// Request and Response for Authz
//=========================================
export interface AuthzTokenJWT extends JWTPayload {
  client_id: string;
  client_secret: string;
  grant_type: string;
}

export interface AuthzTokenSuccessResponse {
  token_type: string;
  access_token: string;
  aud: string;
  exp: number;
}

export type AuthzTokenErrorResponse = SgNotifyErrorResponse;

//==============================================
// Request and Response for Send Notification
//==============================================
export class NotificationRequestDetails {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unique_id?: string;

  @IsString()
  @IsNotEmpty()
  uin: string;

  @ValidateIf((val) => val.uin === '')
  @IsString()
  topic?: string;

  @IsString()
  @IsNotEmpty()
  channel_mode: 'SPM' | 'SMS' | 'SPMORSMS';

  @IsString()
  @IsNotEmpty()
  delivery: 'IMMEDIATE' | 'SCHEDULE';

  @IsNotEmpty()
  @IsArray()
  @Type(() => TemplateLayout)
  template_layout: TemplateLayout[];

  @ValidateIf((val) => val.channel_mode !== 'SMS')
  @MaxLength(50)
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  sender_name: string;

  @ValidateIf((val) => val.channel_mode !== 'SMS')
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  sender_logo_small: string;

  @ValidateIf((val) => val.channel_mode !== 'SMS')
  @IsString()
  @IsNotEmpty()
  category: 'MESSAGES';

  @ValidateIf((val) => val.channel_mode !== 'SMS')
  @IsString()
  @IsNotEmpty()
  priority: 'HIGH' | 'NORMAL';

  @IsOptional()
  @IsArray()
  @Type(() => CTA)
  cta?: CTA[];

  @ValidateIf((val) => val.channel_mode !== 'SPM')
  @IsString()
  mobile_number?: string;

  @ValidateIf((val) => val.delivery === 'SCHEDULE')
  @IsString()
  schedule_time?: string;

  @ValidateIf((val) => val.channel_mode === 'SMS')
  @IsString()
  @IsNotEmpty()
  @Min(1)
  @Max(48)
  sms_trigger_hours?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  hero_image?: string;

  @IsOptional()
  @IsString()
  is_secure?: 'Y' | 'N';

  @IsOptional()
  @IsString()
  playload_type?: string;

  @IsOptional()
  @IsString()
  led_color?: string;

  @IsOptional()
  @IsString()
  accent_color?: string;

  @IsOptional()
  @IsString()
  sound?: string;

  @IsOptional()
  @IsString()
  group_key?: string;

  @IsOptional()
  @IsString()
  big_picture?: string;

  @IsOptional()
  @IsString()
  time_to_live?: string;

  @IsOptional()
  @IsString()
  collapse_key?: string;

  @IsOptional()
  @IsString()
  big_sender_logo?: string;
}

class TemplateLayout {
  @IsString()
  @IsNotEmpty()
  template_id: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  template_input: Record<string, string>;
}

class CTA {
  @IsString()
  @IsNotEmpty()
  action_name: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  action_url: string;

  @IsString()
  @IsNotEmpty()
  action_type: 'HYPERLINK' | 'NAVIGATION' | 'API' | 'API_NO_CONFIRM';
}

export class NotificationRequestBody {
  @IsNotEmpty()
  @Type(() => NotificationRequestDetails)
  notification_req: NotificationRequestDetails;
}

export interface NotificationRequestSucessResponse {
  request_id: string;
}

export type NotificationRequestErrorResponse = SgNotifyErrorResponse;

//==============================================
// Request and Response for Notification Status
//==============================================
export interface NotificationStatusResponse {
  status: string;
  delivery_mode: string;
  sent_date: string;
  read_date?: string;
}

//===================================================
// Request and Response for Multiple Notification
//===================================================
export class MultipleNotificationRequestBody {
  @IsNotEmpty()
  @Type(() => NotificationRequestDetails)
  notification_requests: NotificationRequestDetails[];
}

export interface MultipleNotificationRequestSucessResponse {
  notification_responses: MultipleNotificationResponseData[];
}

interface MultipleNotificationResponseData {
  request_id: string;
  unique_id?: string;
  error_message?: string;
}

//==============================================
// Request and Response for Multiple Notification Status
//==============================================
export interface MultipleNotificationStatusRequestBody {
  ntf_status: {
    ntf_request_ids: string[];
  };
}

export interface MultipleNotificationStatusRequestSucessResponse {
  ntf_status_response: MultipleNotificationStatuBody[];
}

interface MultipleNotificationStatuBody {
  request_id: string;
  status: string;
}
