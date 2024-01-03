import { PaginationOptions } from '@filesg/common';

import {
  AllFileAssetsFromAgencyRequestDto,
  AllFileAssetsFromCitizenRequestDto,
  AllFileAssetsFromCorporateRequestDto,
} from '../../../../dtos/file/request';

export interface FindAndCountViewableFileAssetsInputs {
  ownerId: number;
  query: AllFileAssetsFromCitizenRequestDto | AllFileAssetsFromAgencyRequestDto | AllFileAssetsFromCorporateRequestDto;
  agencyId?: number;
}

export interface FindAndCountRecentFileAssetsInputs extends PaginationOptions {
  ownerId: number;
}

export interface FindAndCountCorporateViewableFileAssetsInputs extends FindAndCountViewableFileAssetsInputs {
  historyActionById?: number;
}

export interface FindCorporateRecentViewableFileAssetsInputs {
  historyActionById?: number;
  ownerId: number;
  query: PaginationOptions;
  accessibleAgencyCodes?: string[];
}
