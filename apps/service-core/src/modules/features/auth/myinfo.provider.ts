import { MyInfo } from '@govtechsg/singpass-myinfo-oidc-helper';
import { Provider } from '@nestjs/common';

import { MYINFO_PROVIDER } from '../../../typings/common';
import { FileSGConfigService } from '../../setups/config/config.service';

export const MyinfoProvider: Provider = {
  provide: MYINFO_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: async (configService: FileSGConfigService) => {
    const { appId, appSecret, privateKey, environment, verificationCert } = configService.myinfoConfig;
    return new MyInfo.Helper({
      clientID: appId,
      clientSecret: appSecret,
      singpassEserviceID: configService.singpassConfig.serviceId,
      environment: environment,
      keyToDecryptJWE: privateKey,
      certToVerifyJWS: verificationCert,
      privateKeyToSignRequest: privateKey,
    });
  },
};
