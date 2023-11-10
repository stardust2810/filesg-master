import { MCC_STATUS_CODE } from "../../typings/common";

export class MyIcaDologinResponse {
  header: MyIcaDologinResponseHeader | null;
  token: string | null;
  scheme: string | null;
  status: MY_ICA_DO_LOGIN_RESPONSE_STATUS;
  bundle: null;
}

export enum MY_ICA_DO_LOGIN_RESPONSE_STATUS {
  AUTHENTICATED = '0',
  NOT_AUTHENTICATED = '1'
}

class MyIcaDologinResponseHeader {
  esvc: string;
  singpassID: string;
  ipRefNo: string;
  timestamp: Date;
}

export class MccApiResponse {
  retrievalStatus: MCC_STATUS_CODE;
  personalInfo: MccApiResponsePersonalInfo;
  contactInfo: MccApiResponseContactInfo;
}

class MccApiResponsePersonalInfo {
  personSurname: string;
  personName: string;
}

class MccApiResponseContactInfo {
  contactMobileNo: string;
  contactEmailAddr: string;
}
