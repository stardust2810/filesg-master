import { OaConfig } from '@filesg/common';
import { v2 } from '@govtechsg/open-attestation';
import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { RawDocument } from '../../../../typings/common';

export class DefaultOaGeneratorService {
  private readonly logger = new Logger(DefaultOaGeneratorService.name);

  protected oaConfig: OaConfig;

  constructor(oaConfig: OaConfig) {
    this.oaConfig = oaConfig;
  }

  protected generateIssuer(agencyName: string, identityProofLocation: string, walletAddress: string): v2.Issuer {
    return {
      id: `did:ethr:${walletAddress}`,
      name: agencyName,
      revocation: {
        type: v2.RevocationType.OcspResponder,
        location: this.oaConfig.revocationLocation,
      },
      identityProof: {
        type: v2.IdentityProofType.DNSDid,
        location: identityProofLocation,
        key: `did:ethr:${walletAddress}#controller`,
      },
    };
  }

  protected generateRawDocument(oaData: Record<string, string>, oaType: string, issuer: v2.Issuer): RawDocument {
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
      },
    };
  }

  public generateOa(
    oaType: string,
    oaData: Record<string, string>,
    agencyName: string,
    identityProofLocation: string,
    walletAddress: string,
  ) {
    const issuer: v2.Issuer = this.generateIssuer(agencyName, identityProofLocation, walletAddress);

    return this.generateRawDocument(oaData, oaType, issuer);
  }
}
