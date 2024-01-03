import { OTP_CHANNEL, Send2FaOtpNonSingpassResponse } from '@filesg/common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

interface FirstFaInput {
  activityUuid: string;
  uin: string;
  dob: {
    day: string;
    month: string;
    year: string;
  };
}

interface NonSingpassSessionState {
  sessionId: string | null;
  firstFaInput: FirstFaInput | null;
  firstFaToken: string;
  maskedMobile: string;
  maskedEmail: string;
  secondFaToken: string;
  otpDetails: Send2FaOtpNonSingpassResponse | null;
  contentRetrievalToken: string;
  tokenExpiry: string;
  expiryDurationSecs: number;
  warningDurationSecs: number;
  hasShownExpiryBanner: boolean;
  isSessionWarningPopUpShown: boolean;
  isSessionTimedout: boolean;
  isActivityBannedFromNonSingpassVerification: boolean;
  isActivityNonSingpassVerifiable: boolean;
  hasPerformedDocumentAction: boolean;
  otpChannel: OTP_CHANNEL | null;
}

const initialState: NonSingpassSessionState = {
  sessionId: null,
  firstFaInput: null,
  firstFaToken: '',
  maskedMobile: '',
  maskedEmail: '',
  secondFaToken: '',
  otpDetails: null,
  contentRetrievalToken: '',
  tokenExpiry: '',
  expiryDurationSecs: -1,
  warningDurationSecs: -1,
  hasShownExpiryBanner: false,
  isSessionWarningPopUpShown: false,
  isSessionTimedout: false,
  isActivityBannedFromNonSingpassVerification: false,
  isActivityNonSingpassVerifiable: false,
  hasPerformedDocumentAction: false,
  otpChannel: null,
};

export const nonSingpassSessionSlice = createSlice({
  name: 'non-singpass-session',
  initialState,
  reducers: {
    setNonSingpassSession: (state, action: PayloadAction<NonSingpassSessionState>) => {
      Object.assign(state, action.payload);
    },
    setFirstFaInput: (state, action: PayloadAction<FirstFaInput | null>) => {
      state.firstFaInput = action.payload;
    },
    setFirstFaToken: (state, action: PayloadAction<string>) => {
      state.firstFaToken = action.payload;
    },
    setMaskedMobile: (state, action: PayloadAction<string>) => {
      state.maskedMobile = action.payload;
    },
    setMaskedEmail: (state, action: PayloadAction<string>) => {
      state.maskedEmail = action.payload;
    },
    setSecondFaToken: (state, action: PayloadAction<string>) => {
      state.secondFaToken = action.payload;
    },
    setOtpDetails: (state, action: PayloadAction<Send2FaOtpNonSingpassResponse | null>) => {
      state.otpDetails = action.payload;
    },
    setContentRetrievalToken: (state, action: PayloadAction<string>) => {
      state.contentRetrievalToken = action.payload;
    },
    setHasShownExpiryBanner: (state, action: PayloadAction<boolean>) => {
      state.hasShownExpiryBanner = action.payload;
    },
    setIsSessionWarningPopUpShown: (state, action: PayloadAction<boolean>) => {
      state.isSessionWarningPopUpShown = action.payload;
    },
    setIsSessionTimedout: (state, action: PayloadAction<boolean>) => {
      state.isSessionTimedout = action.payload;
    },
    setIsActivityBannedFromNonSingpassVerification: (state, action: PayloadAction<boolean>) => {
      state.isActivityBannedFromNonSingpassVerification = action.payload;
    },
    setIsActivityNonSingpassVerifiable: (state, action: PayloadAction<boolean>) => {
      state.isActivityNonSingpassVerifiable = action.payload;
    },
    setHasPerformedDocumentAction: (state, action: PayloadAction<boolean>) => {
      state.hasPerformedDocumentAction = action.payload;
    },
    setOtpChannel: (state, action: PayloadAction<OTP_CHANNEL>) => {
      state.otpChannel = action.payload;
    },
    updateNonSingpassSession: (state, action: PayloadAction<Partial<NonSingpassSessionState>>) => {
      Object.assign(state, action.payload);
    },
    resetNonSingpassSessionExceptFirstFaInput: (state) => ({
      ...initialState,
      isActivityNonSingpassVerifiable: state.isActivityNonSingpassVerifiable,
      firstFaInput: state.firstFaInput,
    }),
    resetNonSingpassSessionDueToActivityBan: (state) => ({
      ...initialState,
      isActivityNonSingpassVerifiable: state.isActivityNonSingpassVerifiable,
      isActivityBannedFromNonSingpassVerification: true,
    }),
    resetNonSingpassSessionDueToTimeout: () => ({ ...initialState, isSessionTimedout: true }),
    resetNonSingpassSession: () => initialState,
  },
});

export const {
  setFirstFaInput,
  setFirstFaToken,
  setMaskedMobile,
  setMaskedEmail,
  setOtpDetails,
  setOtpChannel,
  setHasShownExpiryBanner,
  setIsSessionWarningPopUpShown,
  setIsSessionTimedout,
  setIsActivityBannedFromNonSingpassVerification,
  setIsActivityNonSingpassVerifiable,
  setHasPerformedDocumentAction,
  updateNonSingpassSession,
  resetNonSingpassSessionExceptFirstFaInput,
  resetNonSingpassSessionDueToActivityBan,
  resetNonSingpassSessionDueToTimeout,
  resetNonSingpassSession,
} = nonSingpassSessionSlice.actions;
export const selectFirstFaInput = (state: RootState) => state.nonSingpassSession.firstFaInput;
export const selectFirstFaToken = (state: RootState) => state.nonSingpassSession.firstFaToken;
export const selectMaskedMobile = (state: RootState) => state.nonSingpassSession.maskedMobile;
export const selectMaskedEmail = (state: RootState) => state.nonSingpassSession.maskedEmail;
export const selectOtpDetails = (state: RootState) => state.nonSingpassSession.otpDetails;
export const selectOtpChannel = (state: RootState) => state.nonSingpassSession.otpChannel;
export const selectContentRetrievalToken = (state: RootState) => state.nonSingpassSession.contentRetrievalToken;
export const selectTokenExpiry = (state: RootState) => state.nonSingpassSession.tokenExpiry;
export const selectExpiryDurationSecs = (state: RootState) => state.nonSingpassSession.expiryDurationSecs;
export const selectNonSingpassVerified = (state: RootState) => !!state.nonSingpassSession.contentRetrievalToken;
export const selectHasShownExpiryBanner = (state: RootState) => state.nonSingpassSession.hasShownExpiryBanner;
export const selectWarningDurationSecs = (state: RootState) => state.nonSingpassSession.warningDurationSecs;
export const selectIsSessionWarningPopUpShown = (state: RootState) => state.nonSingpassSession.isSessionWarningPopUpShown;
export const selectIsSessionTimedout = (state: RootState) => state.nonSingpassSession.isSessionTimedout;
export const selectIsActivityBannedFromNonSingpassVerification = (state: RootState) =>
  state.nonSingpassSession.isActivityBannedFromNonSingpassVerification;
export const selectIsActivityNonSingpassVerifiable = (state: RootState) => state.nonSingpassSession.isActivityNonSingpassVerifiable;
export const selectHasPerformedDocumentAction = (state: RootState) => state.nonSingpassSession.hasPerformedDocumentAction;
