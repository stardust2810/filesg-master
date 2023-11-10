import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class IcaSsoRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}
