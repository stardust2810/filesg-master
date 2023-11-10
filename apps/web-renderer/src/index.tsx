import { FileSGThemes } from '@filesg/design-system';
import { FramedDocumentRenderer } from '@govtechsg/decentralized-renderer-react-components';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';

import { queryClient } from './config/query-client';
import { registry } from './oa-templates';
import { GlobalStyles } from './styles/global';

document.title = 'Open Attestation Decentralised Renderer';

ReactDOM.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={FileSGThemes[0]}>
        <GlobalStyles />
        <FramedDocumentRenderer templateRegistry={registry} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
  document.getElementById('root'),
);
