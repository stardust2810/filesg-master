import {
  AddOrUpdateTemplateResponse,
  AgencyOnboardingRequest,
  AgencyOnboardingResponse,
  AgencyProgrammaticUserRole,
  AgencyUsersOnboardingResponse,
  EserviceAcknowledgementTemplateOnboardingEserviceResponse,
  EserviceAcknowledgementTemplateOnboardingRequest,
  EserviceAcknowledgementTemplateOnboardingResponse,
  EserviceOnboardingRequest,
  EserviceOnboardingResponse,
  EserviceUserOnboardingResponseDetails,
  IssuanceQueryResponse,
  NOTIFICATION_STATUS,
  ProgrammaticUserOnboardingResponseDetails,
  USER_TYPE,
} from '@filesg/common';

import { AcknowledgementTemplate } from '../../entities/acknowledgement-template';
import { Agency } from '../../entities/agency';
import { Application } from '../../entities/application';
import { ApplicationType } from '../../entities/application-type';
import { Eservice } from '../../entities/eservice';
import { NotificationMessageTemplate } from '../../entities/notification-message-template';
import { TransactionCustomMessageTemplate } from '../../entities/transaction-custom-message-template';
import { EserviceUser, ProgrammaticUser } from '../../entities/user';
import { AgencyUsers } from '../../typings/common';

export function transformAgencyOnboardingResponse(
  originalRequestBody: AgencyOnboardingRequest | EserviceOnboardingRequest,
  agency: Agency,
  eservices: Eservice[],
  applicationTypes: ApplicationType[],
  eserviceNameAgencyUsersMap: Record<string, AgencyUsers>,
  acknowledgementTemplates: AcknowledgementTemplate[],
  transactionTemplates?: TransactionCustomMessageTemplate[],
  notificationTemplates?: NotificationMessageTemplate[],
  walletAddress?: string,
): AgencyOnboardingResponse {
  const transfromedEservicesOnboardedResponse = transformEserviceOnboardingResponse(
    originalRequestBody,
    agency,
    eservices,
    applicationTypes,
    eserviceNameAgencyUsersMap,
    acknowledgementTemplates,
    walletAddress,
  );

  return {
    ...transfromedEservicesOnboardedResponse,
    transactionTemplates: transactionTemplates?.map(({ uuid, name }) => ({ name, uuid })),
    notificationTemplates: notificationTemplates?.map(({ uuid, name }) => ({ name, uuid })),
  };
}

export function transformEserviceOnboardingResponse(
  originalRequestBody: AgencyOnboardingRequest | EserviceOnboardingRequest,
  agency: Agency,
  eservices: Eservice[],
  applicationTypes: ApplicationType[],
  eserviceNameAgencyUsersMap: Record<string, AgencyUsers>,
  acknowledgementTemplates: AcknowledgementTemplate[],
  walletAddress?: string,
): EserviceOnboardingResponse {
  const { eservices: inputEservices } = originalRequestBody;

  const { uuid: agencyUuid, code: agencyCode, name: agencyName } = agency;
  const applicationTypesCodeIndex = applicationTypes.reduce<Record<string, ApplicationType>>((acc, curr) => {
    acc[curr.code] = curr;

    return acc;
  }, {});

  const eserviceRet = inputEservices.map((inputEservice, index) => {
    const { applicationTypes, acknowledgementTemplates: inputAcknowledgementTemplates } = inputEservice;
    const { id: eserviceId, uuid: eserviceUuid, name: eserviceName, emails: eserviceEmails } = eservices[index];

    const { programmaticUsers, eserviceUsers } = eserviceNameAgencyUsersMap[eserviceName];
    const { users } = transformAgencyUsersOnboardingResponse(programmaticUsers, eserviceUsers);

    return {
      uuid: eserviceUuid,
      name: eserviceName,
      emails: eserviceEmails,
      users,
      applicationTypes: applicationTypes?.map((applicationType) => {
        const { uuid, name, code } = applicationTypesCodeIndex[applicationType.code];
        return { name, code, uuid };
      }),
      acknowledgementTemplates:
        inputAcknowledgementTemplates && inputAcknowledgementTemplates.length > 0
          ? acknowledgementTemplates
              .filter(({ eserviceId: createdTemplateEserviceId }) => createdTemplateEserviceId === eserviceId)
              .map(({ uuid, name }) => ({ uuid, name }))
          : undefined,
    };
  });

  return {
    agencyUuid,
    agencyCode,
    agencyName,
    didPublicKey: walletAddress ? `did:ethr:${walletAddress}#controller` : undefined,
    eservices: eserviceRet,
  };
}

export function transformAgencyUsersOnboardingResponse(
  programmaticUsers: ProgrammaticUser[],
  eserviceUsers: EserviceUser[],
): AgencyUsersOnboardingResponse {
  const programmaticUsersDetails: ProgrammaticUserOnboardingResponseDetails[] = programmaticUsers.map(
    ({ role, clientId, clientSecret }) => ({
      type: USER_TYPE.PROGRAMMATIC, // hard coded because inherited tables don't return discriminator column when saving
      role: role as AgencyProgrammaticUserRole,
      clientId,
      clientSecret,
    }),
  );

  const eserviceUsersDetails: EserviceUserOnboardingResponseDetails[] = eserviceUsers.map(({ role }) => ({
    type: USER_TYPE.ESERVICE, // hard coded because inherited tables don't return discriminator column when saving
    role,
  }));

  return {
    users: [...programmaticUsersDetails, ...eserviceUsersDetails],
  };
}

export function transformAddOrUpdateTemplatesResponse(
  agency: Agency,
  templates: { uuid: string; name: string }[],
): AddOrUpdateTemplateResponse {
  return {
    agencyCode: agency.code,
    templates: templates.map(({ uuid, name }) => ({ name, uuid })),
  };
}

export function transformEserviceAcknowledgementTemplateOnboardingResponse(
  originalRequestBody: EserviceAcknowledgementTemplateOnboardingRequest,
  agency: Agency,
  eservices: Eservice[],
  acknowledgementTemplates: AcknowledgementTemplate[],
): EserviceAcknowledgementTemplateOnboardingResponse {
  const { eservices: inputEservices } = originalRequestBody;
  const { uuid: agencyUuid, code: agencyCode, name: agencyName } = agency;

  const eserviceRet = inputEservices.reduce<EserviceAcknowledgementTemplateOnboardingEserviceResponse[]>((prev, _, index) => {
    const { id: eserviceId, uuid: eserviceUuid, name: eserviceName } = eservices[index];

    prev.push({
      uuid: eserviceUuid,
      name: eserviceName,
      acknowledgementTemplates: acknowledgementTemplates
        .filter(({ eserviceId: createdTemplateEserviceId }) => createdTemplateEserviceId === eserviceId)
        .map(({ uuid, name }) => ({ uuid, name })),
    });
    return prev;
  }, []);

  return {
    agencyUuid,
    agencyCode,
    agencyName,
    eservices: eserviceRet,
  };
}

export function transformIssuanceQueryResponse(
  result: Application[],
  searchValue: string | undefined,
  agencyCode?: string,
  startDateString?: string,
  endDateString?: string,
): IssuanceQueryResponse {
  if (!searchValue) {
    return {
      result: [],
    };
  }
  return {
    searchValue,
    agencyCode,
    startDateString,
    endDateString,
    result: result.map((application) => ({
      externalRefId: application.externalRefId!,
      transactions: application.transactions!.map((transaction) => ({
        uuid: transaction.uuid,
        status: transaction.status,
        createdAt: transaction.createdAt,
        activities: transaction.activities!.map((activity) => ({
          uuid: activity.uuid,
          status: activity.status,
          files: activity.fileAssets!.map((file) => ({
            name: file.name,
            status: file.status,
            metadata: file.metadata,
          })),
          recipientInfo: {
            name: activity.recipientInfo?.name,
            email: activity.recipientInfo?.email,
            mobile: activity.recipientInfo?.mobile,
          },
          notificationStatus: activity.notificationHistories!.map((notification) => ({
            channel: notification.notificationChannel,
            sentTime: notification.createdAt,
            status: notification.status,
            failureReason: notification.status === NOTIFICATION_STATUS.FAILED ? notification.statusDetails : null,
          })),
        })),
      })),
    })),
  };
}
