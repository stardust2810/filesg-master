/* eslint-disable no-param-reassign */
import { AccessibleAgency, ROLE, SSO_ESERVICE, USER_TYPE } from '@filesg/common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

interface SessionState {
  userName: string | null;
  userMaskedUin: string | null;
  userType: USER_TYPE | null;
  userRole: ROLE | null;
  isOnboarded: boolean | null;
  isAfterLogout: boolean;
  lastLoginAt: Date | null;
  createdAt: Date | null;
  endedAt: string | null;
  absoluteExpiry: Date | null;
  sessionLengthInSecs: number | null;
  isSessionTimedout: boolean;
  isLoggedOut: boolean;
  extendSessionWarningDurationInSecs?: number;
  isSessionMissing: boolean;
  ssoEservice: SSO_ESERVICE | null;
  corporateUen: string | null;
  corporateName: string | null;
  accessibleAgencies: AccessibleAgency[] | null;
}

export const initialState: SessionState = {
  userName: '',
  userMaskedUin: '',
  userType: null,
  userRole: null,
  isOnboarded: false,
  isAfterLogout: false,
  lastLoginAt: null,
  createdAt: null,
  endedAt: null,
  absoluteExpiry: null,
  sessionLengthInSecs: null,
  isLoggedOut: true,
  isSessionTimedout: false,
  isSessionMissing: false,
  ssoEservice: null,
  corporateUen: null,
  corporateName: null,
  accessibleAgencies: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<SessionState>) => {
      const {
        userName,
        userMaskedUin,
        userType,
        userRole,
        isOnboarded,
        lastLoginAt,
        isAfterLogout,
        createdAt,
        endedAt,
        absoluteExpiry,
        sessionLengthInSecs,
        extendSessionWarningDurationInSecs,
        isSessionMissing,
        isSessionTimedout,
        ssoEservice,
        corporateUen,
        corporateName,
        accessibleAgencies,
      } = action.payload;
      state.userName = userName;
      state.userMaskedUin = userMaskedUin;
      state.userType = userType;
      state.userRole = userRole;
      state.isOnboarded = isOnboarded;
      state.isAfterLogout = isAfterLogout;
      state.lastLoginAt = lastLoginAt;
      state.createdAt = createdAt;
      state.endedAt = endedAt;
      state.absoluteExpiry = absoluteExpiry;
      state.sessionLengthInSecs = sessionLengthInSecs;
      state.extendSessionWarningDurationInSecs = extendSessionWarningDurationInSecs;
      state.isSessionMissing = isSessionMissing;
      state.isSessionTimedout = isSessionTimedout;
      state.isSessionMissing = isSessionMissing;
      state.ssoEservice = ssoEservice;
      state.corporateUen = corporateUen;
      state.corporateName = corporateName;
      state.accessibleAgencies = accessibleAgencies;
    },
    updateSession: (state, action: PayloadAction<Partial<SessionState>>) => {
      Object.assign(state, action.payload);
      return state;
    },
    resetSession: () => {
      return { ...initialState };
    },
  },
});

export const { setSession, updateSession, resetSession } = sessionSlice.actions;

// user
export const selectUserName = (state: RootState) => state.session.userName;
export const selectUserMaskedUin = (state: RootState) => state.session.userMaskedUin;
export const selectUserLastLoginAt = (state: RootState) => state.session.lastLoginAt;
export const selectIsUserLoggedIn = (state: RootState) => !!state.session.userType;
export const selectIsCorporateUserFirstLogin = (state: RootState) =>
  state.session.userType === USER_TYPE.CORPORATE_USER && !state.session.lastLoginAt;
export const selectUserType = (state: RootState) => state.session.userType;
export const selectUserOnboarded = (state: RootState) => state.session.isOnboarded;

// corporate
export const selectIsCorporateUser = (state: RootState) => state.session.userType === USER_TYPE.CORPORATE_USER;
export const selectCorporateName = (state: RootState) => state.session.corporateName;
export const selectCorporateUen = (state: RootState) => state.session.corporateUen;
export const selectAccessibleAgencies = (state: RootState) => state.session.accessibleAgencies;

// session
export const selectIsAfterLogout = (state: RootState) => state.session.isAfterLogout;
export const selectCreatedAt = (state: RootState) => state.session.createdAt;
export const selectEndedAt = (state: RootState) => state.session.endedAt;
export const selectAbsoluteExpiry = (state: RootState) => (state.session.absoluteExpiry ? new Date(state.session.absoluteExpiry) : null);
export const selectSessionLengthInSecs = (state: RootState) => state.session.sessionLengthInSecs;
export const selectIsSessionTimedout = (state: RootState) => state.session.isSessionTimedout;
export const selectExtendSessionWarningDurationInSecs = (state: RootState) => state.session.extendSessionWarningDurationInSecs;
export const selectIsSessionMissing = (state: RootState) => state.session.isSessionMissing;
export const selectSsoEservice = (state: RootState) => state.session.ssoEservice;
