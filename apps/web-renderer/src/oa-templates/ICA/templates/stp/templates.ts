import { TemplateWithComponent } from '@govtechsg/decentralized-renderer-react-components';

import { LtpPass } from '../../../../typings';
import { StpTemplate } from '.';

export const stpTemplates: TemplateWithComponent<LtpPass>[] = [
  {
    id: 'STP',
    label: 'STP',
    template: StpTemplate,
  },
];
