import './assets/styles/scss/app.scss';
import 'react-toastify/dist/ReactToastify.css';

import { FileSGThemes, GlobalStyles } from '@filesg/design-system';
import { CookiesProvider } from 'react-cookie';
import ReactDOM from 'react-dom';
import TagManager from 'react-gtm-module';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';

import { App } from './app';
import { awsRumManager } from './config/aws-rum-config';
import { queryClient } from './config/query-client';
import { store } from './store/store';

const persistor = persistStore(store);

const tagManagerArgs = {
  gtmId: 'GTM-M4JXJBP',
};

TagManager.initialize(tagManagerArgs);
awsRumManager.init();

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <CookiesProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={FileSGThemes[0]}>
            <ReactQueryDevtools initialIsOpen={false} />
            <GlobalStyles />
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </CookiesProvider>
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);
