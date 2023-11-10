import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOaRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oaDocument: string;
}
