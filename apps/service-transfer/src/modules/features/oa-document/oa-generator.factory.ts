import { OA_TYPE } from '@filesg/common';
import { Injectable } from '@nestjs/common';

import { RawDocument } from '../../../typings/common';
import { FileSGConfigService } from '../../setups/config/config.service';
import { IcaOaGeneratorService } from './oa-document-generators/ica-oa-generator.service';
import { DefaultOaGeneratorService } from './oa-document-generators/oa-generator.service';

@Injectable()
export class OaFactory {
  constructor(private fileSGConfigService: FileSGConfigService) {}

  private getOaGenerator(oaType: OA_TYPE): DefaultOaGeneratorService {
    switch (oaType) {
      case OA_TYPE.LTVP:
      case OA_TYPE.DP:
      case OA_TYPE.STP:
        return new IcaOaGeneratorService(this.fileSGConfigService.oaConfig);
      default:
        return new DefaultOaGeneratorService(this.fileSGConfigService.oaConfig);
    }
  }

  public generateOa(
    oaType: OA_TYPE,
    oaData: Record<string, string>,
    agencyName: string,
    identityProofLocation: string,
    walletAddress: string,
  ): RawDocument {
    const instance = this.getOaGenerator(oaType);
    return instance.generateOa(oaType, oaData, agencyName, identityProofLocation, walletAddress);
  }
}
