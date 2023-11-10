import { OA_TYPE } from '@filesg/common';
import { v2 } from '@govtechsg/open-attestation';
import { v4 as uuid } from 'uuid';

import { RawDocument } from '../../../../typings/common';
import { oaImageIdEncryptionTransformer } from '../../../../utils/encryption';
import { DefaultOaGeneratorService } from './oa-generator.service';

export class IcaOaGeneratorService extends DefaultOaGeneratorService {
  protected override generateRawDocument(
    oaData: Record<string, string>,
    oaType: OA_TYPE.LTVP | OA_TYPE.DP | OA_TYPE.STP,
    issuer: v2.Issuer,
  ): RawDocument {
    const { fin } = oaData;
    const encryptedFin = oaImageIdEncryptionTransformer.to(fin) as string;

    return {
      id: uuid(),
      $template: {
        name: oaType,
        type: v2.TemplateType.EmbeddedRenderer,
        url: this.oaConfig.rendererUrl,
      },
      issuers: [issuer],
      recipient: {
        name: oaData.name,
      },
      agencyData: {
        ...oaData,
        photoId: encryptedFin,
      },
    };
  }
}
