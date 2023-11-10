import { ApiProperty } from '@nestjs/swagger';

import { Metadata } from '../../typings/common';

export class FileAssetIssuanceDetailsResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  metadata: Metadata | null;
}

export class ActivityIssuanceRecipientInfoResponse {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  email?: string | undefined;

  @ApiProperty()
  mobile?: string | undefined;
}

export class ActivityNotificationHistoryIssuanceResponse {
  @ApiProperty()
  channel: string;

  @ApiProperty()
  sentTime: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  failureReason: string | null;
}

export class ActivityIssuanceDetailsResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  files: FileAssetIssuanceDetailsResponse[];

  @ApiProperty()
  recipientInfo?: ActivityIssuanceRecipientInfoResponse;

  @ApiProperty()
  notificationStatus: ActivityNotificationHistoryIssuanceResponse[];
}

export class TransactionIssuanceDetailsResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  activities: ActivityIssuanceDetailsResponse[];
}

export class ApplicationIssuanceDetailsReponse {
  @ApiProperty()
  externalRefId: string;

  @ApiProperty()
  transactions: TransactionIssuanceDetailsResponse[];
}

export class IssuanceReportResponse {
  @ApiProperty()
  searchValue?: string;

  @ApiProperty()
  agencyCode?: string | undefined;

  @ApiProperty()
  startDateString?: string | undefined;

  @ApiProperty()
  endDateString?: string | undefined;

  @ApiProperty()
  result: ApplicationIssuanceDetailsReponse[];
}
