import { ApiProperty } from '@nestjs/swagger';

import { USER_TYPE } from '../../constants/common';
import { AgencyProgrammaticUserRole, EserviceUserRole } from '../../typings/common';

export class AgencyUsersOnboardingResponse {
  users: (ProgrammaticUserOnboardingResponseDetails | EserviceUserOnboardingResponseDetails)[];
}

export class BaseAgencyUserOnboardingResponseDetails {
  @ApiProperty()
  type: USER_TYPE.PROGRAMMATIC | USER_TYPE.ESERVICE;

  @ApiProperty()
  role: AgencyProgrammaticUserRole | EserviceUserRole;
}

export class ProgrammaticUserOnboardingResponseDetails extends BaseAgencyUserOnboardingResponseDetails {
  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientSecret: string;
}

export class EserviceUserOnboardingResponseDetails extends BaseAgencyUserOnboardingResponseDetails {}

export class AgencyOnboardingBaseTemplateResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;
}
export class AgencyOnboardingAcknowledgementTemplateResponse extends AgencyOnboardingBaseTemplateResponse {}

export class AgencyOnboardingTransactionTemplateResponse extends AgencyOnboardingBaseTemplateResponse {}

export class AgencyOnboardingNotificationTemplateResponse extends AgencyOnboardingBaseTemplateResponse {}

export class AgencyOnboardingApplicationTypeResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class AgencyOnboardingProgrammaticUserResponse {
  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientSecret: string;
}

export class AgencyOnboardingEserviceResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  emails: string[];

  @ApiProperty()
  users: (ProgrammaticUserOnboardingResponseDetails | EserviceUserOnboardingResponseDetails)[];

  @ApiProperty()
  applicationTypes?: AgencyOnboardingApplicationTypeResponse[];

  @ApiProperty()
  acknowledgementTemplates?: AgencyOnboardingAcknowledgementTemplateResponse[];
}

export class BaseOnboardingResponse {
  @ApiProperty()
  agencyUuid: string;

  @ApiProperty()
  agencyName: string;

  @ApiProperty()
  agencyCode: string;
}

export class EserviceOnboardingResponse extends BaseOnboardingResponse {
  @ApiProperty()
  didPublicKey?: string;

  @ApiProperty()
  eservices: AgencyOnboardingEserviceResponse[];
}

export class AgencyOnboardingResponse extends EserviceOnboardingResponse {
  @ApiProperty()
  transactionTemplates?: AgencyOnboardingTransactionTemplateResponse[];

  @ApiProperty()
  notificationTemplates?: AgencyOnboardingNotificationTemplateResponse[];
}

export class AddOrUpdateTemplateResponse {
  @ApiProperty()
  agencyCode: string;

  @ApiProperty()
  templates?: AgencyOnboardingBaseTemplateResponse[];
}

export class EserviceAcknowledgementTemplateOnboardingEserviceResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  acknowledgementTemplates?: AgencyOnboardingAcknowledgementTemplateResponse[];
}

export class EserviceAcknowledgementTemplateOnboardingResponse extends BaseOnboardingResponse {
  eservices: EserviceAcknowledgementTemplateOnboardingEserviceResponse[];
}

export class EserviceTransactionTemplateOnboardingResponse extends BaseOnboardingResponse {
  eservices: EserviceAcknowledgementTemplateOnboardingEserviceResponse[];
}

export class EserviceNotificationTemplateOnboardingResponse extends BaseOnboardingResponse {
  eservices: EserviceAcknowledgementTemplateOnboardingEserviceResponse[];
}
