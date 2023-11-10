/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ThemeMode } from '../../consts';
import { RootState } from '../store';

interface AppState {
  theme: ThemeMode;
  hasUnexpectedError: boolean;
  sessionTimeout: string | null;
  isShowingLoginModal: boolean;
  hasShowedCorppassFirstLoginModal: boolean;
}

const initialState: AppState = {
  theme: ThemeMode.PRIMARY,
  hasUnexpectedError: false,
  sessionTimeout: null,
  isShowingLoginModal: false,
  hasShowedCorppassFirstLoginModal: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setApp: (state, action: PayloadAction<AppState>) => {
      const { theme, sessionTimeout } = action.payload;
      state.theme = theme;
      state.sessionTimeout = sessionTimeout;
    },
    setIsShowingLoginModal: (state, action: PayloadAction<boolean>) => {
      state.isShowingLoginModal = action.payload;
    },
    setHasUnexpectedError: (state, action: PayloadAction<boolean>) => {
      state.hasUnexpectedError = action.payload;
    },
    setHasShowedCorppassFirstLoginModal: (state, action: PayloadAction<boolean>) => {
      state.hasShowedCorppassFirstLoginModal = action.payload;
    },
    updateApp: (state, action: PayloadAction<Partial<AppState>>) => {
      Object.assign(state, action.payload);
      return state;
    },
    resetApp: () => {
      return { ...initialState };
    },
  },
});

export const { resetApp, setIsShowingLoginModal, updateApp, setHasUnexpectedError, setHasShowedCorppassFirstLoginModal } = appSlice.actions;
export const selectSessionTimeout = (state: RootState) => state.app.sessionTimeout;
export const selectIsShowingLoginModal = (state: RootState) => state.app.isShowingLoginModal;
export const selectHasUnexpectedError = (state: RootState) => state.app.hasUnexpectedError;
export const selectHasShowedCorppassFirstLoginModal = (state: RootState) => state.app.hasShowedCorppassFirstLoginModal;
