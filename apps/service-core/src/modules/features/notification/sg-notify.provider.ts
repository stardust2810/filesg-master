import { SgNotify } from '@filesg/sg-notify';
import { Provider } from '@nestjs/common';
import { createPrivateKey } from 'crypto';
import { exportJWK } from 'jose';

import { FileSGConfigService } from '../../setups/config/config.service';

export const SG_NOTIFY_PROVIDER = 'SG_NOTIFY_PROVIDER';
export const SgNotifyProvider: Provider = {
  provide: SG_NOTIFY_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: async (configService: FileSGConfigService) => {
    const { sigPrivateKey, encPrivateKey, sigPublicKid, encPublicKid } = configService.authConfig;
    const { clientId, clientSecret, apiEndpoint, jwksEndpoint } = configService.sgNotifyConfig;
    const ALGO = 'ES512';

    const sigPrivKey = createPrivateKey(sigPrivateKey);
    const signPrivJWK = await exportJWK(sigPrivKey);
    signPrivJWK.kid = sigPublicKid;
    signPrivJWK.use = 'sig';
    signPrivJWK.alg = ALGO;

    const encPrivKey = createPrivateKey(encPrivateKey);
    const encPrivJWK = await exportJWK(encPrivKey);
    encPrivJWK.kid = encPublicKid;
    encPrivJWK.use = 'enc';
    encPrivJWK.alg = 'ECDH-ES+A256KW';

    return new SgNotify({
      client_id: clientId,
      client_secret: clientSecret,
      apiEndpoint,
      jwksEndpoint,
      jwsPrivateKey: { key: signPrivJWK, alg: ALGO },
      jwePrivateKey: { key: encPrivJWK, alg: ALGO },
      keyAlgoritm: 'ES512',
    });
  },
};
