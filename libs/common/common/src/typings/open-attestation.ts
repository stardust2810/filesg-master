import { v2 } from '@govtechsg/open-attestation';

import { OA_REVOCATION_REASON_CODE, REVOCATION_TYPE } from '../constants/common';

export interface VerificationResult {
  documentIntegrity: boolean;
  documentStatus: boolean;
  issuerIdentity: boolean;
  overall: boolean;
  revocationType: REVOCATION_TYPE | null;
}

export type AgencySignedWrappedOaDocument = v2.SignedWrappedDocument<AgencyOaDocument>;

export interface AgencyOaDocument extends v2.OpenAttestationDocument {
  agencyData: AgencyData;
}

export type AgencyData = LtvpAgencyData & StpAgencyData & DpAgencyData;

export interface BaseIcaAgencyData {
  name: string;
  hanyupinyinName?: string;
  fin: string;
  dob: string;
  sex: Sex;
  nationality: string;
  address: string[];
  issuedOn: string;
  expireOn: string;
  photoId?: string;
  mjvInd?: boolean;
}

export interface LtvpAgencyData extends BaseIcaAgencyData {
  plusInd?: boolean;
}

export type StpAgencyData = BaseIcaAgencyData;

export type DpAgencyData = BaseIcaAgencyData;

export type OaConfig = {
  revocationLocation: string;
  rendererUrl: string;
};

export type OaRevocationTypeMapper = {
  [key in REVOCATION_TYPE]: OA_REVOCATION_REASON_CODE;
};

// =============================================================================
// Enums
// =============================================================================
export enum PassStatus {
  LIVE = 'live',
  DEAD = 'dead',
}

export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

// =============================================================================
// Consts
// =============================================================================
// Using native reason code to identify filesg revocation reasons.
// OA reason code reasons not representitive of revoke type. I.e. randomly assigned
export const OaDocumentRevocationTypeMapper: OaRevocationTypeMapper = {
  [REVOCATION_TYPE.CANCELLED]: OA_REVOCATION_REASON_CODE.UNSPECIFIED,
  [REVOCATION_TYPE.EXPIRED]: OA_REVOCATION_REASON_CODE.KEY_COMPROMISE,
  [REVOCATION_TYPE.UPDATED]: OA_REVOCATION_REASON_CODE.CA_COMPROMISE,
  [REVOCATION_TYPE.RECALLED]: OA_REVOCATION_REASON_CODE.AFFILIATION_CHANGED,
};
