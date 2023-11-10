import 'styled-components';

import { FileSGDefaultTheme } from '@filesg/design-system';

export declare module 'styled-components' {
  export interface DefaultTheme extends FileSGDefaultTheme {
    name: string;
  }
}
