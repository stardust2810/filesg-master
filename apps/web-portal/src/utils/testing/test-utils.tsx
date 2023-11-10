import { FileSGThemes } from '@filesg/design-system';
import { EnhancedStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Route,Router, Routes } from 'react-router-dom';
import { DefaultTheme, ThemeProvider } from 'styled-components';

import { configureAppStore, RootState } from '../../store/store';

const queryClient = new QueryClient();

interface Props {
  preloadedState?: Partial<RootState>;
  store?: EnhancedStore;
  client?: QueryClient;
  theme?: DefaultTheme;
  route?: string;
  path?: string;
  history?: MemoryHistory;
}

export const renderComponent = (
  ui: React.ReactElement,
  {
    preloadedState,
    client = queryClient,
    theme = FileSGThemes[0],
    route = '/',
    path = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
    ...renderOptions
  }: Props,
) => {
  const Wrapper = ({ children }: { children?: any }) => (
    <Provider store={configureAppStore({ preloadedState })}>
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
          <Router location={history.location} navigator={history}>
            <Routes>
              <Route path={path} element={children} />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};
