import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class MyIcaDoLoginRequest {
  @IsEmpty()
  header: null;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEmpty()
  scheme: null;

  @IsEmpty()
  status: null;

  @IsEmpty()
  bundle: null;
}

export class MccApiRequest {
  @IsString()
  @IsNotEmpty()
  eSvcID: string;

  @IsString()
  @IsNotEmpty()
  infoSrc: '3';

  @IsString()
  @IsNotEmpty()
  uin: string;
}
