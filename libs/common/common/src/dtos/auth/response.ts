import { ApiProperty } from '@nestjs/swagger';

export class MyInfoUserDetailsResponse {
  @ApiProperty({ type: String, nullable: true })
  name: string | null;

  @ApiProperty({ type: String, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, nullable: true })
  phoneNumber: string | null;
}

export class MyInfoComponentUserDetailsResponse {
  @ApiProperty({ nullable: true })
  duplicateEmail: string | null;
}

export class GetLoginContextResponse {
  @ApiProperty({ type: String })
  url: string;
}

export class LogoutResponse {
  @ApiProperty({ type: String })
  sessionEndTime: string;
}
