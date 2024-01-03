import { InputValidationException, LogMethod } from '@filesg/backend-common';
import {
  AddNotificationTemplatesRequest,
  AddTransactionTemplatesRequest,
  AgencyOnboardingEserviceRequest,
  AgencyOnboardingRequest,
  AgencyOnboardingResponse,
  AgencyUserOnboardingDetails,
  AgencyUsersOnboardingRequest,
  COMPONENT_ERROR_CODE,
  EserviceAcknowledgementTemplateOnboardingEserviceRequest,
  EserviceAcknowledgementTemplateOnboardingRequest,
  EserviceOnboardingRequest,
  EserviceWhitelistedUsersOnboardingRequest,
  INTEGRATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  NotificationTemplateOnboardingRequest,
  NotificationTemplateUpdateRequest,
  ROLE,
  STATUS,
  TEMPLATE_TYPE,
  TransactionTemplateOnboardingRequest,
  UpdateNotificationTemplatesRequest,
  UpdateTransactionTemplatesRequest,
  USER_TYPE,
} from '@filesg/common';
import { generateEncryptionKey } from '@govtechsg/oa-encryption';
import { Injectable, Logger } from '@nestjs/common';
import { Wallet } from 'ethers';
import { precompile } from 'handlebars';
import { EntityManager, UpdateResult } from 'typeorm';

import {
  DuplicateEserviceWhitelistedUserException,
  InvalidEserviceWhitelistedUserEmailsException,
} from '../../../common/filters/custom-exceptions.filter';
import {
  transformAddOrUpdateTemplatesResponse,
  transformAgencyOnboardingResponse,
  transformAgencyUsersOnboardingResponse,
  transformEserviceAcknowledgementTemplateOnboardingResponse,
  transformEserviceOnboardingResponse,
} from '../../../common/transformers/system.transformer';
import { FORMSG_TEMPLATE_INPUT_PARAGRAPH_FIELD_PREFIX, FORMSG_TEMPLATE_MAX_PARAGRAPH_COUNT } from '../../../consts';
import { AcknowledgementTemplateCreationModel } from '../../../entities/acknowledgement-template';
import { Agency } from '../../../entities/agency';
import { ApplicationType } from '../../../entities/application-type';
import { Eservice, EserviceCreationModel } from '../../../entities/eservice';
import { EserviceWhitelistedUser, EserviceWhitelistedUserCreationModel } from '../../../entities/eservice-whitelisted-user';
import { NotificationMessageTemplate, NotificationMessageTemplateUpdateModel } from '../../../entities/notification-message-template';
import { TransactionCustomMessageTemplate } from '../../../entities/transaction-custom-message-template';
import { EserviceUser, EserviceUserCreationModel, ProgrammaticUser, ProgrammaticUserCreationModel } from '../../../entities/user';
import {
  AgencyUsers,
  DuplicateEserviceWhitelistedUsersAgencyEserviceDetails,
  EserviceUserInput,
  ProgrammaticUserInput,
  UserToEserviceInsertableInput,
} from '../../../typings/common';
import { argon2Hash, generateRandomString } from '../../../utils/encryption';
import { generateEntityUUID } from '../../../utils/helpers';
import { AcknowledgementTemplateEntityService } from '../../entities/acknowledgement-template/acknowledgement-template.entity.service';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { ApplicationTypeEntityService } from '../../entities/application-type/application-type.entity.service';
import { ApplicationTypeNotificationEntityService } from '../../entities/application-type-notification/application-type-notification.entity.service';
import { EserviceEntityService } from '../../entities/eservice/eservice.entity.service';
import { EserviceWhitelistedUserEntityService } from '../../entities/eservice-whitelisted-user/eservice-whitelisted-user.entity.service';
import { NotificationMessageTemplateEntityService } from '../../entities/notification-message-template/notification-message-template.entity.service';
import { NotificationMessageTemplateAuditEntityService } from '../../entities/notification-message-template-audit/notification-message-template-audit.entity.service';
import { TransactionCustomMessageTemplateEntityService } from '../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.service';
import { EserviceUserEntityService } from '../../entities/user/eservice-user.entity.service';
import { ProgrammaticUserEntityService } from '../../entities/user/programmatic-user.entity.service';
import { DatabaseTransactionService } from '../../setups/database/db-transaction.service';

@Injectable()
export class AgencyOnboardingService {
  private readonly logger = new Logger(AgencyOnboardingService.name);

  constructor(
    private readonly programmaticUserEntityService: ProgrammaticUserEntityService,
    private readonly eserviceUserEntityService: EserviceUserEntityService,
    private readonly agencyEntityService: AgencyEntityService,
    private readonly eserviceEntityService: EserviceEntityService,
    private readonly applicationTypeEntityService: ApplicationTypeEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
    private readonly acknowledgementTemplateEntityService: AcknowledgementTemplateEntityService,
    private readonly transactionCustomMessageTemplateEntityService: TransactionCustomMessageTemplateEntityService,
    private readonly notificationMessateTemplateEntityService: NotificationMessageTemplateEntityService,
    private readonly notificationMessateTemplateAuditEntityService: NotificationMessageTemplateAuditEntityService,
    private readonly applicationTypeNotificationEntityService: ApplicationTypeNotificationEntityService,
    private readonly eserviceWhitelistedUserEntityService: EserviceWhitelistedUserEntityService,
  ) {}

  // ===========================================================================
  // Public Methods
  // ===========================================================================
  /**
   * This endpoint will only handle new agency.
   */
  private readonly AGENCY_NOT_FOUND_ERROR_MESSAGE = 'Agency does not exist';

  public async onboardNewAgency(agencyOnboardingRequest: AgencyOnboardingRequest): Promise<AgencyOnboardingResponse> {
    if (await this.agencyEntityService.isAgencyExistsByCode(agencyOnboardingRequest.agencyCode)) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, 'Agency already exists');
    }

    const {
      agencyName,
      agencyCode,
      identityProofLocation,
      eservices: inputEservices,
      transactionTemplates: inputTransactionTemplates,
      notificationTemplates: inputNotificationTemplates,
    } = agencyOnboardingRequest;

    let walletAddress: string | undefined;
    let oaSigningKey: string | undefined;

    if (identityProofLocation) {
      oaSigningKey = `0x${generateEncryptionKey()}`;
      walletAddress = new Wallet(oaSigningKey).address;
    }

    const { entityManager, commit, rollback } = await this.databaseTransactionService.startTransaction();

    try {
      const agency = await this.agencyEntityService.saveAgency(
        {
          code: agencyCode.trim(),
          name: agencyName,
          oaSigningKey,
          identityProofLocation,
        },
        entityManager,
      );

      const { eservices, applicationTypes, eserviceNameAgencyUsersMap, acknowledgementTemplates } =
        await this.createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates(agency, agencyOnboardingRequest, entityManager);

      // Create provided templates
      let transactionTemplates: TransactionCustomMessageTemplate[] | undefined = undefined;
      if (inputTransactionTemplates && inputTransactionTemplates.length > 0) {
        transactionTemplates = await this.createTransactionCustomMessageTemplates(inputTransactionTemplates, agency, entityManager);
      }

      let notificationTemplates: NotificationMessageTemplate[] | undefined = undefined;
      if (inputNotificationTemplates && inputNotificationTemplates.length > 0) {
        notificationTemplates = await this.createNotificationMessageTemplates(inputNotificationTemplates, agency, entityManager);
      }

      // Create FormSG default templates
      let requiresFormSgIntegration = false;
      const allEservicesNotificationChannels: NOTIFICATION_CHANNEL[] = [];
      inputEservices.forEach(({ users, applicationTypes }) => {
        if (users.find(({ type, role }) => type === USER_TYPE.ESERVICE && role === ROLE.FORMSG)) {
          requiresFormSgIntegration = true;
        }

        if (applicationTypes) {
          allEservicesNotificationChannels.push(...applicationTypes.flatMap(({ notificationChannels }) => notificationChannels));
        }
      });

      const requiredNotificationChannels = new Set<NOTIFICATION_CHANNEL>(allEservicesNotificationChannels);

      // Check if already have formsg default templates
      if (requiresFormSgIntegration) {
        const notificationChannelsTemplatesToCreate = Array.from(requiredNotificationChannels);
        await this.createFormSgIssuanceAgencyTransactionAndNotificationTemplates(
          agency,
          true,
          notificationChannelsTemplatesToCreate,
          entityManager,
        );
      }

      await commit();

      return transformAgencyOnboardingResponse(
        agencyOnboardingRequest,
        agency,
        eservices,
        applicationTypes,
        eserviceNameAgencyUsersMap,
        acknowledgementTemplates,
        transactionTemplates,
        notificationTemplates,
        walletAddress,
      );
    } catch (err) {
      const errorMessage = (err as Error).message;
      this.logger.error(errorMessage);
      await rollback();
      throw err;
    }
  }

  public async onboardNewEservices(input: EserviceOnboardingRequest) {
    const { agencyCode, eservices: inputEservices } = input;

    const agency = await this.agencyEntityService.retrieveAgencyWithEservicesByCode(agencyCode);

    if (!agency) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, this.AGENCY_NOT_FOUND_ERROR_MESSAGE);
    }

    const existingEserviceNames = agency.eservices!.map((eservice) => eservice.name);
    const duplicatedEserviceNames: string[] = [];

    inputEservices.forEach((eservice) => {
      if (existingEserviceNames.includes(eservice.name)) {
        duplicatedEserviceNames.push(eservice.name);
      }
    });

    // if any of the input eservices is already an existing eservice of the agency
    if (duplicatedEserviceNames.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        `Agency ${agency.name} (${agencyCode}) already has eservices: ${duplicatedEserviceNames.join(', ')}`,
      );
    }

    // everything is ok, no duplicated eservices, can create new eservices
    const { entityManager, commit, rollback } = await this.databaseTransactionService.startTransaction();

    try {
      const { eservices, applicationTypes, eserviceNameAgencyUsersMap, acknowledgementTemplates } =
        await this.createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates(agency, input, entityManager);

      // Create FormSG default templates
      let requiresFormSgIntegration = false;
      const allEservicesNotificationChannels: NOTIFICATION_CHANNEL[] = [];
      inputEservices.forEach(({ users, applicationTypes }) => {
        if (users.find(({ type, role }) => type === USER_TYPE.ESERVICE && role === ROLE.FORMSG)) {
          requiresFormSgIntegration = true;
        }

        if (applicationTypes) {
          allEservicesNotificationChannels.push(...applicationTypes.flatMap(({ notificationChannels }) => notificationChannels));
        }
      });

      const requiredNotificationChannels = new Set<NOTIFICATION_CHANNEL>(allEservicesNotificationChannels);

      // Check if already have formsg default templates
      const { notificationMessageTemplates, transactionCustomMessageTemplates } =
        await this.agencyEntityService.retrieveAgencyByIdWithFormSgTransactionAndNotificationTemplates(agency.id);

      notificationMessageTemplates!.forEach(({ notificationChannel }) => {
        requiredNotificationChannels.delete(notificationChannel);
      });

      if (requiresFormSgIntegration) {
        const notificationChannelsTemplatesToCreate = Array.from(requiredNotificationChannels);
        await this.createFormSgIssuanceAgencyTransactionAndNotificationTemplates(
          agency,
          transactionCustomMessageTemplates!.length === 0,
          notificationChannelsTemplatesToCreate,
          entityManager,
        );
      }

      await commit();

      return transformEserviceOnboardingResponse(
        input,
        agency,
        eservices,
        applicationTypes,
        eserviceNameAgencyUsersMap,
        acknowledgementTemplates,
      );
    } catch (err) {
      const errorMessage = (err as Error).message;
      this.logger.error(errorMessage);
      await rollback();
      throw err;
    }
  }

  public async onboardNewEserviceAcknowledgementTemplate(input: EserviceAcknowledgementTemplateOnboardingRequest) {
    const { agencyCode, eservices: inputEservices } = input;

    const agency = await this.agencyEntityService.retrieveAgencyWithEservicesByCode(agencyCode);

    if (!agency) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, this.AGENCY_NOT_FOUND_ERROR_MESSAGE);
    }

    const existingEserviceNames = agency.eservices!.map((eservice) => eservice.name);
    const unknownEserviceNames: string[] = [];

    inputEservices.forEach((eservice) => {
      if (!existingEserviceNames.includes(eservice.name)) {
        unknownEserviceNames.push(eservice.name);
      }
    });

    // if any of the input eservices is not existing eservice of the agency
    if (unknownEserviceNames.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        `Agency ${agency.name} (${agencyCode}) has no such eservices: ${unknownEserviceNames.join(', ')}`,
      );
    }

    // this is the part that re-arrange the queried eservices based on the inputEservices for use in createAcknowledgementTemplates function
    const eservices = inputEservices.map(
      (inputEservice) => agency.eservices!.filter((eservice) => eservice.name === inputEservice.name)[0],
    );

    const txn = await this.databaseTransactionService.startTransaction();

    try {
      const acknowledgementTemplates = await this.createAcknowledgementTemplates(inputEservices, eservices, txn.entityManager);
      await txn.commit();

      return transformEserviceAcknowledgementTemplateOnboardingResponse(input, agency, eservices, acknowledgementTemplates);
    } catch (err) {
      await txn.rollback();
      this.logger.error(err);
      throw err;
    }
  }

  public async onboardNewTransactionCustomMessageTemplate(input: AddTransactionTemplatesRequest) {
    const { agencyCode, transactionTemplates: inputTransactionTemplates } = input;

    const templateNames = inputTransactionTemplates.map((template) => template.name);
    const agency = await this.agencyEntityService.retrieveAgencyByCodeWithTemplatesByNames(
      agencyCode,
      templateNames,
      TEMPLATE_TYPE.TRANSACTION_CUSTOM_MESSAGE,
    );

    if (!agency) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, this.AGENCY_NOT_FOUND_ERROR_MESSAGE);
    }

    const duplicatedTransactionTemplatesNames = agency.transactionCustomMessageTemplates!.map((template) => template.name);
    if (duplicatedTransactionTemplatesNames.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        `Agency ${agency.name} (${agencyCode}) already has transaction custom message templates: ${duplicatedTransactionTemplatesNames.join(
          ', ',
        )}`,
      );
    }

    const newTemplates = await this.createTransactionCustomMessageTemplates(inputTransactionTemplates, agency);
    return transformAddOrUpdateTemplatesResponse(agency, newTemplates);
  }

  public async updateTransactionCustomMessageTemplate(input: UpdateTransactionTemplatesRequest) {
    const { agencyCode, transactionTemplates: inputTransactionTemplates } = input;

    const agency = await this.agencyEntityService.retrieveAgencyByCode(agencyCode);

    if (!agency) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, this.AGENCY_NOT_FOUND_ERROR_MESSAGE);
    }

    const txn = await this.databaseTransactionService.startTransaction();

    try {
      const updatedTemplatesPromise: Promise<UpdateResult>[] = inputTransactionTemplates.map((template) =>
        this.transactionCustomMessageTemplateEntityService.updateTransactionCustomMessageTemplate(
          template.uuid,
          { ...template, requiredFields: this.extractDynamicFieldsFromTemplate(template.uuid, template.template) },
          txn.entityManager,
        ),
      );
      const updatedResults = await Promise.all(updatedTemplatesPromise);
      const updatedTemplateUuidsAndNames = updatedResults.map((updateResult) => {
        return { uuid: updateResult.raw.uuid, name: updateResult.raw.name };
      });
      await txn.commit();
      return transformAddOrUpdateTemplatesResponse(agency, updatedTemplateUuidsAndNames);
    } catch (err) {
      await txn.rollback();
      this.logger.error(err);
      throw err;
    }
  }

  public async onboardNewNotificationMessageTemplate(input: AddNotificationTemplatesRequest) {
    const { agencyCode, notificationTemplates: inputNotificationTemplates } = input;

    const templateNames = inputNotificationTemplates.map((template) => template.name);
    const agency = await this.agencyEntityService.retrieveAgencyByCodeWithTemplatesByNames(
      agencyCode,
      templateNames,
      TEMPLATE_TYPE.NOTIFICATION_MESSAGE,
    );

    if (!agency) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, this.AGENCY_NOT_FOUND_ERROR_MESSAGE);
    }

    const duplicatedNotificationTemplatesNames = agency.notificationMessageTemplates!.map((template) => template.name);
    if (duplicatedNotificationTemplatesNames.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        `Agency ${agency.name} (${agencyCode}) already has notification message templates: ${duplicatedNotificationTemplatesNames.join(
          ', ',
        )}`,
      );
    }

    const newTemplates = await this.createNotificationMessageTemplates(inputNotificationTemplates, agency);
    return transformAddOrUpdateTemplatesResponse(agency, newTemplates);
  }

  public async updateNotificationMessageTemplate(input: UpdateNotificationTemplatesRequest) {
    const { agencyCode, notificationTemplates: inputNotificationTemplates } = input;

    const agency = await this.agencyEntityService.retrieveAgencyByCode(agencyCode);

    if (!agency) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, this.AGENCY_NOT_FOUND_ERROR_MESSAGE);
    }

    const txn = await this.databaseTransactionService.startTransaction();

    try {
      const updatedTemplatesPromise = inputNotificationTemplates.map((template) =>
        this.updateNotificationMessageTemplateAndCreateAudit(template, txn.entityManager),
      );
      const updatedTemplateUuidsAndNames = await Promise.all(updatedTemplatesPromise);
      await txn.commit();

      return transformAddOrUpdateTemplatesResponse(agency, updatedTemplateUuidsAndNames);
    } catch (error) {
      await txn.rollback();

      const errorMessage = (error as Error).message;
      this.logger.error(errorMessage);

      throw error;
    }
  }

  public async onboardNewAgencyUsers({ agencyCode, eserviceName, users }: AgencyUsersOnboardingRequest) {
    // check agencyCode & eserviceName
    const eservice = await this.eserviceEntityService.retrieveEserviceByAgencyCodeAndEserviceName(agencyCode, eserviceName);

    const { entityManager, commit, rollback } = await this.databaseTransactionService.startTransaction();

    try {
      const { programmaticUsers, eserviceUsers } = await this.createAgencyUsers(users, entityManager);

      await this.associateUsersToEservice([{ eservice, users: [...programmaticUsers, ...eserviceUsers] }], entityManager);

      await commit();

      return transformAgencyUsersOnboardingResponse(programmaticUsers, eserviceUsers);
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.error(errorMessage);

      await rollback();
      throw error;
    }
  }

  public async onboardNewEserviceWhitelistedUsers({ agencyCode, eserviceName, emails }: EserviceWhitelistedUsersOnboardingRequest) {
    // Get eserviceUser based on agencyCode and eserviceName. If no user returned, throw EntityNotFound
    const eserviceUser = await this.eserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName(
      agencyCode,
      eserviceName,
    );

    // Check if emails already exist, return agency & eservice details if exist
    const eserviceUsers = await this.eserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails(emails);

    if (eserviceUsers.length > 0) {
      const duplicateEserviceWhitelistedUsersDetailsList: DuplicateEserviceWhitelistedUsersAgencyEserviceDetails[] = eserviceUsers.map(
        (user) => ({
          agencyCode: user.eservices![0].agency!.code,
          eserviceName: user.eservices![0].name,
          eserviceWhiteListedUsers: user.whitelistedUsers!.map((user) => ({ email: user.email, status: user.status })),
        }),
      );

      throw new DuplicateEserviceWhitelistedUserException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        duplicateEserviceWhitelistedUsersDetailsList,
      );
    }

    const eserviceWhitelistedUserCreationModels: EserviceWhitelistedUserCreationModel[] = emails.map((email) => {
      return {
        email,
        eserviceUser,
        status: STATUS.ACTIVE,
      };
    });

    await this.eserviceWhitelistedUserEntityService.insertEserviceWhitelistedUsers(eserviceWhitelistedUserCreationModels);
  }

  /**
   * Input requires agencyCode & eserviceName to ensure emails deleted only belongs to requesting agency/eservice
   */
  public async inactivateNewEserviceWhitelistedUsers({ agencyCode, eserviceName, emails }: EserviceWhitelistedUsersOnboardingRequest) {
    // Get eserviceUser based on agencyCode and eserviceName. If no user returned, throw EntityNotFound
    const eserviceUser = await this.eserviceUserEntityService.retrieveEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName(
      agencyCode,
      eserviceName,
    );

    const eserviceWhitelistedUsersToInactivate = eserviceUser.whitelistedUsers!.filter((whitelistedUser) =>
      emails.includes(whitelistedUser.email),
    );

    const activeEserviceWhitelistedUsers: EserviceWhitelistedUser[] = [];
    const inactiveEserviceWhitelistedUsers: EserviceWhitelistedUser[] = [];

    eserviceWhitelistedUsersToInactivate.forEach((whitelistedUser) => {
      if (whitelistedUser.status === STATUS.ACTIVE) {
        return activeEserviceWhitelistedUsers.push(whitelistedUser);
      }
      inactiveEserviceWhitelistedUsers.push(whitelistedUser);
    });

    if (activeEserviceWhitelistedUsers.length !== emails.length) {
      const emailsToInactivate = eserviceWhitelistedUsersToInactivate.map((whitelistedUser) => whitelistedUser.email);
      const missingEmails = emails.filter((email) => !emailsToInactivate.includes(email));

      throw new InvalidEserviceWhitelistedUserEmailsException(COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE, {
        notFound: missingEmails,
        inactive: inactiveEserviceWhitelistedUsers.map((whitelistedUser) => whitelistedUser.email),
      });
    }

    await this.eserviceWhitelistedUserEntityService.updateEserviceWhitelistedUsersByEmails(emails, { status: STATUS.INACTIVE });
  }

  // ===========================================================================
  // Private / Protected Methods
  // ===========================================================================
  @LogMethod()
  protected async createEservicesWithUsersAndAppTypesAndAcknowledgmentTemplates(
    agency: Agency,
    input: AgencyOnboardingRequest | EserviceOnboardingRequest,
    entityManager: EntityManager,
  ) {
    const { eservices: inputEservices } = input;

    const eserviceNameAgencyUsersMap: Record<string, AgencyUsers> = {};
    const eservices = await this.createAndSaveEservicesWithCascadeEntities(agency.id, inputEservices, entityManager);

    const userToEserviceInsertableInputs: UserToEserviceInsertableInput[] = [];
    for await (const [index, { name: eserviceName, users: inputUsers }] of inputEservices.entries()) {
      const { programmaticUsers, eserviceUsers } = await this.createAgencyUsers(inputUsers, entityManager);

      eserviceNameAgencyUsersMap[eserviceName] = { programmaticUsers, eserviceUsers };

      userToEserviceInsertableInputs.push({
        eservice: eservices[index],
        users: [...programmaticUsers, ...eserviceUsers],
      });
    }

    await this.associateUsersToEservice(userToEserviceInsertableInputs, entityManager);

    const applicationTypes = eservices.reduce<ApplicationType[]>((applicationTypes, eservice) => {
      if (eservice.applicationTypes) {
        applicationTypes.push(...eservice.applicationTypes);
      }

      return applicationTypes;
    }, []);

    const acknowledgementTemplates = await this.createAcknowledgementTemplates(inputEservices, eservices, entityManager);

    return {
      eservices,
      applicationTypes,
      eserviceNameAgencyUsersMap,
      acknowledgementTemplates,
    };
  }

  protected async createAndSaveEservicesWithCascadeEntities(
    agencyId: number,
    inputEservices: AgencyOnboardingEserviceRequest[],
    entityManager: EntityManager,
  ) {
    const eserviceInsertables = this.generateEserviceAndCascadeEntitiesInsertables(agencyId, inputEservices);

    return await this.eserviceEntityService.saveEservices(eserviceInsertables, entityManager);
  }

  protected generateEserviceAndCascadeEntitiesInsertables(agencyId: number, inputEservices: AgencyOnboardingEserviceRequest[]) {
    return inputEservices.map(({ name, emails, applicationTypes: inputApplicationTypes }): EserviceCreationModel => {
      const applicationTypes = inputApplicationTypes?.map((applicationType) => {
        const applicationTypeNotifications = applicationType.notificationChannels.map((notificationChannel) =>
          this.applicationTypeNotificationEntityService.buildApplicationTypeNotification({ notificationChannel }),
        );

        return this.applicationTypeEntityService.buildApplicationType({
          ...applicationType,
          applicationTypeNotifications,
        });
      });

      return {
        name,
        emails,
        agencyId,
        applicationTypes,
      };
    });
  }

  // this will return programmatic clientSecret and clientId in plaintext
  protected async createProgrammaticUsers(programmaticUserInputs: ProgrammaticUserInput[], entityManager: EntityManager) {
    const [plainClientSecretArray, programmaticUserModels] = await this.generateProgrammaticUserInsertables(programmaticUserInputs);
    const programmaticUsers = await this.programmaticUserEntityService.saveProgrammaticUsers(programmaticUserModels, entityManager);

    return programmaticUsers.map((user, index) => {
      user.clientSecret = plainClientSecretArray[index];

      return user;
    });
  }

  protected async createEserviceUsers(eserviceUserInputs: EserviceUserInput[], entityManager: EntityManager) {
    const emails = eserviceUserInputs.flatMap((input) => input.emails);

    // Check for duplicate emails
    const eserviceUsers = await this.eserviceUserEntityService.retrieveEserviceUsersWithAgencyAndEserviceByWhitelistedEmails(emails);

    if (eserviceUsers.length > 0) {
      const duplicateEserviceWhitelistedUsersDetailsList: DuplicateEserviceWhitelistedUsersAgencyEserviceDetails[] = eserviceUsers.map(
        (user) => ({
          agencyCode: user.eservices![0].agency!.code,
          eserviceName: user.eservices![0].name,
          eserviceWhiteListedUsers: user.whitelistedUsers!.map((user) => ({ email: user.email, status: user.status })),
        }),
      );

      throw new DuplicateEserviceWhitelistedUserException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        duplicateEserviceWhitelistedUsersDetailsList,
      );
    }

    const eserviceUserModels = this.generateEserviceUserInsertables(eserviceUserInputs);

    return await this.eserviceUserEntityService.saveEserviceUsers(eserviceUserModels, entityManager);
  }

  protected async createAgencyUsers(users: AgencyUserOnboardingDetails, entityManager: EntityManager): Promise<AgencyUsers> {
    const programmaticUserInputs: ProgrammaticUserInput[] = [];
    const eserviceUserInputs: EserviceUserInput[] = [];
    users.forEach((user) => {
      const { type, role } = user;

      if (type === USER_TYPE.PROGRAMMATIC) {
        programmaticUserInputs.push({ role });
      }
      if (type === USER_TYPE.ESERVICE) {
        eserviceUserInputs.push({ role, emails: user.emails });
      }
    });

    let programmaticUsers: ProgrammaticUser[] = [];
    if (programmaticUserInputs.length > 0) {
      programmaticUsers = await this.createProgrammaticUsers(programmaticUserInputs, entityManager);
    }

    let eserviceUsers: EserviceUser[] = [];
    if (eserviceUserInputs.length > 0) {
      eserviceUsers = await this.createEserviceUsers(eserviceUserInputs, entityManager);
    }

    return { programmaticUsers, eserviceUsers };
  }

  protected async createAcknowledgementTemplates(
    inputEservices: AgencyOnboardingEserviceRequest[] | EserviceAcknowledgementTemplateOnboardingEserviceRequest[],
    eservices: Eservice[],
    entityManager: EntityManager,
  ) {
    const acknowledgementTemplateModels: AcknowledgementTemplateCreationModel[] = [];

    inputEservices.forEach(({ acknowledgementTemplates }, index) => {
      if (acknowledgementTemplates) {
        acknowledgementTemplates.forEach(({ name, content: inputContent }) => {
          acknowledgementTemplateModels.push({
            name,
            content: { content: inputContent },
            eservice: eservices[index],
          });
        });
      }
    });

    return await this.acknowledgementTemplateEntityService.insertAcknowledgementTemplates(
      acknowledgementTemplateModels,
      true,
      entityManager,
    );
  }

  protected async createTransactionCustomMessageTemplates(
    transactionTemplateOnboardingRequests: TransactionTemplateOnboardingRequest[],
    agency: Agency,
    entityManager?: EntityManager,
  ) {
    const transactionTemplateCreationModels = transactionTemplateOnboardingRequests.map((transactionTemplateOnboardingRequest) => {
      const requiredFields = this.extractDynamicFieldsFromTemplate(
        transactionTemplateOnboardingRequest.name,
        transactionTemplateOnboardingRequest.template,
      );
      return this.transactionCustomMessageTemplateEntityService.buildTransactionCustomMessageTemplate({
        ...transactionTemplateOnboardingRequest,
        requiredFields,
        agency,
      });
    });

    return await this.transactionCustomMessageTemplateEntityService.saveTransactionCustomMessageTemplates(
      transactionTemplateCreationModels,
      entityManager,
    );
  }

  protected async createNotificationMessageTemplates(
    notificationTemplateOnboardingRequests: NotificationTemplateOnboardingRequest[],
    agency: Agency,
    entityManager?: EntityManager,
  ) {
    const notificationTemplateCreationModels = notificationTemplateOnboardingRequests.map((notificationTemplateOnboardingRequest) => {
      const requiredFields = this.extractDynamicFieldsFromTemplate(
        notificationTemplateOnboardingRequest.name,
        notificationTemplateOnboardingRequest.template,
      );
      return this.notificationMessateTemplateEntityService.buildNotificationMessageTemplate({
        ...notificationTemplateOnboardingRequest,
        requiredFields,
        agency,
      });
    });

    return await this.notificationMessateTemplateEntityService.saveNotificationMessageTemplates(
      notificationTemplateCreationModels,
      entityManager,
    );
  }

  protected async updateNotificationMessageTemplateAndCreateAudit(
    notificationMessageTemplateUpdateRequest: NotificationTemplateUpdateRequest,
    entityManager?: EntityManager,
  ): Promise<{ uuid: string; name: string }> {
    const {
      uuid,
      template: newTemplate,
      copyRecipientSubjectAffix: newCopyRecipientSubjectAffix,
    } = notificationMessageTemplateUpdateRequest;

    const oldNotificationMessageTemplate = await this.notificationMessateTemplateEntityService.retrieveNotificationMessageTemplateByUuid(
      uuid,
      { entityManager },
    );
    const { name, template, version, requiredFields, externalTemplateId, copyRecipientSubjectAffix } = oldNotificationMessageTemplate;

    const newRequiredFields = this.extractDynamicFieldsFromTemplate(name, newTemplate);

    const newNotificationMessageTemplate: NotificationMessageTemplateUpdateModel = {
      ...notificationMessageTemplateUpdateRequest,
      requiredFields: newRequiredFields,
      copyRecipientSubjectAffix: newCopyRecipientSubjectAffix,
    };

    await Promise.all([
      // using spread operator will result in inserting/updating same audit instance with id = template id
      this.notificationMessateTemplateAuditEntityService.insertNotificationMessageTemplateAudits(
        [
          {
            template,
            version,
            requiredFields,
            externalTemplateId,
            notificationMessageTemplate: oldNotificationMessageTemplate,
            copyRecipientSubjectAffix,
          },
        ],
        entityManager,
      ),
      this.notificationMessateTemplateEntityService.updateNotificationMessageTemplate(uuid, newNotificationMessageTemplate, entityManager),
    ]);

    return { uuid, name };
  }

  protected async createFormSgIssuanceAgencyTransactionAndNotificationTemplates(
    agency: Agency,
    createTransactionTemplate: boolean,
    notificationChannels: NOTIFICATION_CHANNEL[],
    entityManager: EntityManager,
  ) {
    const defaultTemplate = Array.from(
      { length: FORMSG_TEMPLATE_MAX_PARAGRAPH_COUNT },
      (_, index) => `{{${FORMSG_TEMPLATE_INPUT_PARAGRAPH_FIELD_PREFIX}${index + 1}}}`,
    );

    const promiseArray = [];

    if (createTransactionTemplate) {
      const transactionTemplateOnboardingRequest: TransactionTemplateOnboardingRequest[] = [
        {
          name: `${agency.code}-formsg-transaction`,
          type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
          template: defaultTemplate,
          integrationType: INTEGRATION_TYPE.FORMSG,
        },
      ];

      promiseArray.push(this.createTransactionCustomMessageTemplates(transactionTemplateOnboardingRequest, agency, entityManager));
    }

    if (notificationChannels.length > 0) {
      const createNotificationMessageTemplateRequest: NotificationTemplateOnboardingRequest[] = notificationChannels.map(
        (notificationChannel) => {
          return {
            notificationChannel,
            name: `${agency.code}-formsg-${notificationChannel}`,
            type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
            template: defaultTemplate,
            integrationType: INTEGRATION_TYPE.FORMSG,
          };
        },
      );

      promiseArray.push(this.createNotificationMessageTemplates(createNotificationMessageTemplateRequest, agency, entityManager));
    }

    await Promise.all(promiseArray);
  }

  protected async generateProgrammaticUserInsertables(
    programmaticUserInputs: ProgrammaticUserInput[],
  ): Promise<[string[], ProgrammaticUserCreationModel[]]> {
    const plainClientSecrets = [];
    const programmaticUserModels: ProgrammaticUserCreationModel[] = [];
    for (const { role } of programmaticUserInputs) {
      const clientId = generateEntityUUID(ProgrammaticUser.name);
      const clientSecret = generateRandomString(32);
      const hashedClientSecret = await argon2Hash(clientSecret);

      plainClientSecrets.push(clientSecret);
      programmaticUserModels.push({
        role,
        status: STATUS.ACTIVE,
        isOnboarded: true,
        clientId,
        clientSecret: hashedClientSecret,
      });
    }

    return [plainClientSecrets, programmaticUserModels];
  }

  protected generateEserviceUserInsertables(eserviceUserInputs: EserviceUserInput[]): EserviceUserCreationModel[] {
    return eserviceUserInputs.map(({ emails, role }) => {
      const whitelistedUsers = emails.map((email) =>
        this.eserviceWhitelistedUserEntityService.buildEserviceWhitelistedUser({
          email,
          status: STATUS.ACTIVE,
        }),
      );

      return {
        role,
        status: STATUS.ACTIVE,
        isOnboarded: true,
        whitelistedUsers,
      };
    });
  }

  protected async associateUsersToEservice(insertableInputs: UserToEserviceInsertableInput[], entityManager: EntityManager) {
    const eserviceUserInsertables = this.generateEserviceToUserInsertables(insertableInputs);
    await this.eserviceEntityService.associateUsersToEservice(eserviceUserInsertables, entityManager);
  }

  protected generateEserviceToUserInsertables(insertableInputs: UserToEserviceInsertableInput[]) {
    return insertableInputs
      .map(({ eservice, users }) =>
        users.map((user) => ({
          eserviceId: eservice.id,
          userId: user.id,
        })),
      )
      .flat();
  }

  protected extractDynamicFieldsFromTemplate(name: string, template: string[]): string[] | null {
    const regexToExtractDynamicVariable = /\{\{([^{}]+)\}\}/g;
    const regexToTestAlphabetsOnly = /^[a-zA-Z0-9]+$/;

    const stringifiedTemplate = JSON.stringify(template);
    const errorMessagePrefix = `Template: '${name}' is invalid`;

    try {
      precompile(stringifiedTemplate);
    } catch (err) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        `${errorMessagePrefix}. Template compilation failed.`,
      );
    }

    const matches = stringifiedTemplate.match(regexToExtractDynamicVariable);
    if (matches) {
      const extractedDynamicFields = matches.map((match) => match.replace(/[}{]/g, ''));
      const extractedDynamicFieldsOnlyAlphabets = extractedDynamicFields.filter((n) => regexToTestAlphabetsOnly.test(n));
      if (extractedDynamicFields.length !== extractedDynamicFieldsOnlyAlphabets.length) {
        throw new InputValidationException(
          COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
          `${errorMessagePrefix}. Dynamic variables must adhere to the camelCase convention and should only consist of alphanumeric characters.`,
        );
      }
      return extractedDynamicFieldsOnlyAlphabets;
    }
    return null;
  }
}
