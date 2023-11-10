import { FEATURE_TOGGLE } from '@filesg/common';
import { configureStore, getDefaultMiddleware, Middleware } from '@reduxjs/toolkit';

import { config } from '../config/app-config';
import rootReducer from './rootReducer';

const middleware = [
  ...getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST'],
    },
  }),
];

interface ConfigureAppStore {
  preloadedState?: Partial<RootState>;
  middleware?: Middleware[];
}

export const configureAppStore = ({ preloadedState, middleware }: ConfigureAppStore) =>
  configureStore({
    reducer: rootReducer,
    middleware,
    preloadedState,
    devTools: config.toggleReduxDevTool === FEATURE_TOGGLE.ON,
  });

export const store = configureAppStore({ middleware });

export type AppDispatch = ReturnType<typeof configureAppStore>['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;
