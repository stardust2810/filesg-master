import 'styled-components';

import { FileSGDefaultTheme } from '../typings/fsg-theme';

export declare module 'styled-components' {
  export interface DefaultTheme extends FileSGDefaultTheme {
    name: string;
  }
}
