import { TemplateWithComponent } from '@govtechsg/decentralized-renderer-react-components';

import { LtpPass } from '../../../../typings';
import { LtvpTemplate } from '.';

export const ltvpTemplates: TemplateWithComponent<LtpPass>[] = [
  {
    id: 'LTVP',
    label: 'LTVP',
    template: LtvpTemplate,
  },
];
