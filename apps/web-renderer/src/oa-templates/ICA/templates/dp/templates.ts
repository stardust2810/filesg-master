import { TemplateWithComponent } from '@govtechsg/decentralized-renderer-react-components';

import { LtpPass } from '../../../../typings';
import { DpTemplate } from '.';

export const dpTemplates: TemplateWithComponent<LtpPass>[] = [
  {
    id: 'DP',
    label: 'DP',
    template: DpTemplate,
  },
];
