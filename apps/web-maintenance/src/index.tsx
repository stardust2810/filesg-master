import './assets/styles/scss/app.scss';

import { FileSGThemes, GlobalStyles } from '@filesg/design-system';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';

import App from './app';

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={FileSGThemes[0]}>
      <GlobalStyles />
      <App />
    </ThemeProvider>
  </QueryClientProvider>,
  document.getElementById('root'),
);
