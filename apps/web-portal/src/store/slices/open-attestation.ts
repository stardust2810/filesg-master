import { VerificationResult } from '@filesg/common';
import { v2 } from '@govtechsg/open-attestation';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

interface OADocumentWithVerification extends v2.OpenAttestationDocument {
  verificationResult?: VerificationResult | null;
  verificationDate?: string;
}

interface OpenAttestationState {
  document: OADocumentWithVerification | null;
  signedWrappedDocument: v2.SignedWrappedDocument | null;
  verificationResult: VerificationResult | null;
  isConnected: boolean;
  isTemplateRenderingComplete: boolean;
}

const initialState: OpenAttestationState = {
  document: null,
  signedWrappedDocument: null,
  verificationResult: null,
  isConnected: false,
  isTemplateRenderingComplete: false,
};

export const openAttestationSlice = createSlice({
  name: 'open-attestation',
  initialState,
  reducers: {
    setDocument: (state, action: PayloadAction<OADocumentWithVerification | null>) => {
      state.document = action.payload;
    },
    setSignedWrappedDocument: (state, action: PayloadAction<v2.SignedWrappedDocument | null>) => {
      state.signedWrappedDocument = action.payload;
    },
    setVerificationResult: (state, action: PayloadAction<VerificationResult | null>) => {
      state.verificationResult = action.payload;
    },
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setIsTemplateRenderingComplete: (state, action: PayloadAction<boolean>) => {
      state.isTemplateRenderingComplete = action.payload
    },
    resetOpenAttestation: () => initialState,
  },
});

export const { setVerificationResult, setIsConnected, setIsTemplateRenderingComplete, resetOpenAttestation } =
  openAttestationSlice.actions;
export const selectOpenAttestation = (state: RootState) => {
  return state.openAttestation;
};
