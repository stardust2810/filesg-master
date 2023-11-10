import { NdiOidcHelper, NdiOidcHelperConstructor } from '@govtechsg/singpass-myinfo-oidc-helper/dist/corppass';
import { KeyFormat } from '@govtechsg/singpass-myinfo-oidc-helper/dist/util/KeyUtil';
import { Provider } from '@nestjs/common';
import { createPrivateKey } from 'crypto';
import * as Jose from 'jose';

import { CORPPASS_PROVIDER } from '../../../typings/common';
import { FileSGConfigService } from '../../setups/config/config.service';

const corppassFactory = async (configService: FileSGConfigService) => {
  const { clientId, redirectUrl, openIdDiscoveryUrl } = configService.corppassConfig;
  const { encPrivateKey: encPrivateKeyPEM, sigPrivateKey: sigPrivateKeyPEM, sigPublicKid, encPublicKid } = configService.authConfig;
  const ALGO = 'ES512';
  const KEY_FORMAT: KeyFormat = 'json';

  const sigPrivKey = createPrivateKey(sigPrivateKeyPEM);
  const signPrivJWK = await Jose.exportJWK(sigPrivKey);
  signPrivJWK.kid = sigPublicKid;
  signPrivJWK.use = 'sig';
  signPrivJWK.alg = ALGO;

  const encPrivKey = createPrivateKey(encPrivateKeyPEM);
  const encPrivJWK = await Jose.exportJWK(encPrivKey);
  encPrivJWK.kid = encPublicKid;
  encPrivJWK.use = 'enc';
  encPrivJWK.alg = 'ECDH-ES+A256KW';

  const ndiOpts: NdiOidcHelperConstructor = {
    oidcConfigUrl: openIdDiscoveryUrl,
    clientID: clientId,
    redirectUri: redirectUrl,
    jweDecryptKey: { key: JSON.stringify(encPrivJWK), alg: ALGO, format: KEY_FORMAT },
    clientAssertionSignKey: { key: JSON.stringify(signPrivJWK), alg: ALGO, format: KEY_FORMAT },
  };
  return new NdiOidcHelper(ndiOpts);
};

export const CorppassProvider: Provider = {
  provide: CORPPASS_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: corppassFactory,
};
