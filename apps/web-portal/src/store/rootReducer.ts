import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { appSlice } from './slices/app';
import { nonSingpassSessionSlice } from './slices/non-singpass-session';
import { openAttestationSlice } from './slices/open-attestation';
import { sessionSlice } from './slices/session';

const persistAppConfig = {
  key: 'app',
  storage,
};

const rootReducer = combineReducers({
  session: sessionSlice.reducer,
  app: persistReducer(persistAppConfig, appSlice.reducer),
  openAttestation: openAttestationSlice.reducer,
  nonSingpassSession: nonSingpassSessionSlice.reducer,
});

export default rootReducer;
