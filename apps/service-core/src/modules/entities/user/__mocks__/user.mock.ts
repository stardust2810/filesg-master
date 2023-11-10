import { ROLE, USER_TYPE } from '@filesg/common';

import { Corporate, CorporateCreationModel, CorporateWithBaseUserCreationModel } from '../../../../entities/corporate';
import { CorporateUser, CorporateUserCreationModel, CorporateUserWithBaseUserCreationModel } from '../../../../entities/corporate-user';
import {
  AgencyUser,
  AgencyUserCreationModel,
  CitizenUser,
  CitizenUserCreationModel,
  CorporateBaseUser,
  CorporateBaseUserCreationModel,
  CorporateUserBaseUser,
  CorporateUserBaseUserCreationModel,
  EserviceUser,
  EserviceUserCreationModel,
  ProgrammaticUser,
  ProgrammaticUserCreationModel,
} from '../../../../entities/user';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockCitizenUser = (args: TestCreationModel<CitizenUserCreationModel>) => {
  const user = new CitizenUser();

  args.uuid && (user.uuid = args.uuid);
  args.id && (user.id = args.id);
  args.uin && (user.uin = args.uin);
  args.name && (user.name = args.name);
  args.email && (user.email = args.email);
  args.phoneNumber && (user.phoneNumber = args.phoneNumber);
  args.isOnboarded && (user.isOnboarded = args.isOnboarded);
  user.status = args.status;
  args.role && (user.role = args.role);
  args.lastLoginAt && (user.lastLoginAt = args.lastLoginAt);
  user.ownedfileAssets = args.ownedfileAssets;
  args.issuedFileAssets && (user.issuedFileAssets = args.issuedFileAssets);
  user.activities = args.activities;
  user.transactions = args.transactions;
  user.type = USER_TYPE.CITIZEN;

  return user;
};

export const createMockAgencyUser = (args: TestCreationModel<AgencyUserCreationModel>) => {
  const user = new AgencyUser();

  args.uuid && (user.uuid = args.uuid);
  args.id && (user.id = args.id);
  args.uin && (user.uin = args.uin);
  args.name && (user.name = args.name);
  args.email && (user.email = args.email);
  args.phoneNumber && (user.phoneNumber = args.phoneNumber);
  args.isOnboarded && (user.isOnboarded = args.isOnboarded);
  user.status = args.status;
  args.role && (user.role = args.role);
  args.lastLoginAt && (user.lastLoginAt = args.lastLoginAt);
  user.ownedfileAssets = args.ownedfileAssets;
  args.issuedFileAssets && (user.issuedFileAssets = args.issuedFileAssets);
  user.activities = args.activities;
  user.transactions = args.transactions;
  user.eservices = args.eservices;
  user.type = USER_TYPE.AGENCY;

  return user;
};

export const createMockProgrammaticUser = (args: TestCreationModel<ProgrammaticUserCreationModel>) => {
  const user = new ProgrammaticUser();

  args.uuid && (user.uuid = args.uuid);
  args.id && (user.id = args.id);
  args.uin && (user.uin = args.uin);
  args.name && (user.name = args.name);
  args.email && (user.email = args.email);
  args.phoneNumber && (user.phoneNumber = args.phoneNumber);
  args.isOnboarded && (user.isOnboarded = args.isOnboarded);
  user.status = args.status;
  args.role && (user.role = args.role);
  args.lastLoginAt && (user.lastLoginAt = args.lastLoginAt);
  user.ownedfileAssets = args.ownedfileAssets;
  args.issuedFileAssets && (user.issuedFileAssets = args.issuedFileAssets);
  user.activities = args.activities;
  user.transactions = args.transactions;
  user.eservices = args.eservices;
  user.clientId = args.clientId;
  user.clientSecret = args.clientSecret;
  user.type = USER_TYPE.PROGRAMMATIC;

  return user;
};

export const createMockEserviceUser = (args: TestCreationModel<EserviceUserCreationModel>) => {
  const user = new EserviceUser();

  args.uuid && (user.uuid = args.uuid);
  args.id && (user.id = args.id);
  args.uin && (user.uin = args.uin);
  args.name && (user.name = args.name);
  args.email && (user.email = args.email);
  args.phoneNumber && (user.phoneNumber = args.phoneNumber);
  args.isOnboarded && (user.isOnboarded = args.isOnboarded);
  user.status = args.status;
  args.role && (user.role = args.role);
  args.lastLoginAt && (user.lastLoginAt = args.lastLoginAt);
  user.ownedfileAssets = args.ownedfileAssets;
  args.issuedFileAssets && (user.issuedFileAssets = args.issuedFileAssets);
  user.activities = args.activities;
  user.transactions = args.transactions;
  user.eservices = args.eservices;
  user.type = USER_TYPE.ESERVICE;
  args.whitelistedUsers && (user.whitelistedUsers = args.whitelistedUsers);

  return user;
};

// Corporate
export const createMockCorporateBaseUser = (args: TestCreationModel<CorporateBaseUserCreationModel>) => {
  const user = new CorporateBaseUser();

  args.id && (user.id = args.id);
  args.uuid && (user.uuid = args.uuid);
  args.name && (user.name = args.name);
  user.type = USER_TYPE.CORPORATE;
  user.role = ROLE.CORPORATE;
  args.corporate && (user.corporate = args.corporate);

  return user;
};

export const createMockCorporate = (args: TestCreationModel<CorporateCreationModel>) => {
  const user = new Corporate();

  args.id && (user.id = args.id);
  user.uen = args.uen;
  args.user && (user.user = args.user);

  return user;
};

export const createMockCorporateWithBaseUser = (args: TestCreationModel<CorporateWithBaseUserCreationModel>) => {
  const user = new Corporate();

  args.id && (user.id = args.id);
  user.uen = args.uen;
  user.user = createMockCorporateBaseUser(args.user);

  return user;
};

// Corporate User
export const createMockCorporateUserBaseUser = (args: TestCreationModel<CorporateUserBaseUserCreationModel>) => {
  const user = new CorporateUserBaseUser();

  args.id && (user.id = args.id);
  args.uuid && (user.uuid = args.uuid);
  args.name && (user.name = args.name);
  user.type = USER_TYPE.CORPORATE_USER;
  user.role = ROLE.CORPORATE_USER;
  args.corporateUser && (user.corporateUser = args.corporateUser);

  return user;
};

export const createMockCorporateUser = (args: TestCreationModel<CorporateUserCreationModel>) => {
  const user = new CorporateUser();

  args.id && (user.id = args.id);
  user.uin = args.uin;
  user.corporate = args.corporate;
  args.corporateId && (user.corporateId = args.corporateId);
  args.lastLoginAt && (user.lastLoginAt = args.lastLoginAt);
  args.user && (user.user = args.user);

  return user;
};

export const createMockCorporateUserWithBaseUser = (args: TestCreationModel<CorporateUserWithBaseUserCreationModel>) => {
  const user = new CorporateUser();

  args.id && (user.id = args.id);
  user.uin = args.uin;
  user.corporate = args.corporate;
  args.corporateId && (user.corporateId = args.corporateId);
  args.lastLoginAt && (user.lastLoginAt = args.lastLoginAt);
  user.user = createMockCorporateUserBaseUser(args.user);

  return user;
};
