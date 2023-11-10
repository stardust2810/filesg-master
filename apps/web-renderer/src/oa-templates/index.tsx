import { TemplateRegistry } from '@govtechsg/decentralized-renderer-react-components';

import { LtpPass } from '../typings';
import { dpTemplates } from './ICA/templates/dp/templates';
import { ltvpTemplates } from './ICA/templates/ltvp/templates';
import { stpTemplates } from './ICA/templates/stp/templates';

export const registry: TemplateRegistry<LtpPass> = {
  LTVP: ltvpTemplates,
  STP: stpTemplates,
  DP: dpTemplates,
};
