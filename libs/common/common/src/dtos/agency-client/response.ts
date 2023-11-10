import { ApiProperty } from '@nestjs/swagger';

import { CIRIS_STATUS_CODE } from '../../constants/common';

// CIRIS Access Interface v0.02
export class CirisRetrievePhotoApiResponse {
  @ApiProperty({ enum: CIRIS_STATUS_CODE })
  statCd: CIRIS_STATUS_CODE;

  @ApiProperty()
  agencyCd: string;

  @ApiProperty()
  idNo: string;

  @ApiProperty()
  photo: string;
}

class BioRestFacialImageDto {
  imageFormat: string;
  image: string;
  recordId: string;
}
class BioRestFaceInfoDto {
  mugshot: BioRestFacialImageDto;
  thumbnail: BioRestFacialImageDto;
}
class BioRestRegistrationDto {
  faces: BioRestFaceInfoDto[];
}
export class CirisRetrieveBiometricsApiResponse {
  registrationInfoDtoList: BioRestRegistrationDto[];
  errors?: string[];
}
export class AgencyClientPhotoResponse {
  @ApiProperty()
  photo: string;
}

export class CirisRetrieveJwtResponse {
  @ApiProperty()
  token: string;
}
