import { FileUploadJwtPayload, InputValidationException, JWT_TYPE, LogMethod, maskUin, OPS_SUPPORT_CONTEXT } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  compareArrays,
  COMPONENT_ERROR_CODE,
  CreateFileTransactionRecipientResponse,
  CreateFileTransactionResponse,
  CreateFileTransactionV2Request,
  CreateRecipientV2Request,
  CreateTransactionFileResponse,
  CreateTransactionV2Request,
  EXCEPTION_ERROR_CODE,
  FILE_ASSET_ACTION,
  FILE_STATUS,
  FILE_TYPE,
  FileInfo,
  FileUploadTransactionInfo,
  findDuplicateStrings,
  MessageTemplate,
  Metadata,
  NOTIFICATION_CHANNEL,
  NotificationMessage,
  RECIPIENT_TYPE,
  redactUinfin,
  REQUIRED_RECIPIENT_FIELD_FOR_NOTIFICATION,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { AgencyFileUpload, CreateApplicationRequest } from '@filesg/common';
import { FILESG_REDIS_CLIENT, FILESG_REDIS_NAMESPACE, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { UnsupportedTransactionTypeException } from '../../../common/filters/custom-exceptions.filter';
import { Activity, ActivityCreationModel } from '../../../entities/activity';
import { Application } from '../../../entities/application';
import { ApplicationType } from '../../../entities/application-type';
import { CorporateWithBaseUserCreationModel } from '../../../entities/corporate';
import { Eservice } from '../../../entities/eservice';
import { EserviceWhitelistedUser } from '../../../entities/eservice-whitelisted-user';
import { FileAssetHistory } from '../../../entities/file-asset-history';
import { OACertificate } from '../../../entities/oa-certificate';
import { Transaction, TransactionCreationModel } from '../../../entities/transaction';
import { CitizenUser, CitizenUserCreationModel, ProgrammaticUser, User } from '../../../entities/user';
import {
  ActivityRecipientInfo,
  CreateTransactionResponseLog,
  FILE_ASSET_TYPE,
  PartialNotificationMessageInputCreation,
} from '../../../typings/common';
import { docEncryptionPasswordEncryptionTransformer } from '../../../utils/encryption';
import { generateEntityUUID, generateFileSessionUUID, generateOutputFromTemplate } from '../../../utils/helpers';
import { AcknowledgementTemplateEntityService } from '../../entities/acknowledgement-template/acknowledgement-template.entity.service';
import { ActivityFileInsert } from '../../entities/activity/activity.entity.repository';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { ApplicationEntityService } from '../../entities/application/application.entity.service';
import { ApplicationTypeEntityService } from '../../entities/application-type/application-type.entity.service';
import { ApplicationTypeNotificationEntityService } from '../../entities/application-type-notification/application-type-notification.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { FileAssetHistoryEntityService } from '../../entities/file-asset-history/file-asset-history.entity.service';
import { NotificationMessageInputEntityService } from '../../entities/notification-message-input/notification-message-input.entity.service';
import { NotificationMessageTemplateEntityService } from '../../entities/notification-message-template/notification-message-template.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';
import { TransactionCustomMessageTemplateEntityService } from '../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.service';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
import { CorporateEntityService } from '../../entities/user/corporate/corporate.entity.service';
import { UserEntityService } from '../../entities/user/user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { DatabaseTransactionService } from '../../setups/database/db-transaction.service';
import { AuthService } from '../auth/auth.service';
import { EmailBlackListService } from '../email/email-black-list.service';

export interface TxnCreationFileAssetInsert {
  fileInfo: AgencyFileUpload;
  ownerId: number;
  ownerMetadata?: Metadata;
  type: FILE_ASSET_TYPE;
  oaCertificate?: OACertificate;
  issuerId?: number;
  parentId?: number;
}

@Injectable()
export class FileTransactionV2Service {
  private readonly logger = new Logger(FileTransactionV2Service.name);

  constructor(
    private readonly userEntityService: UserEntityService,
    private readonly corporateEntityService: CorporateEntityService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly citizenUserEntityService: CitizenUserEntityService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly applicationEntityService: ApplicationEntityService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly applicationTypeEntityService: ApplicationTypeEntityService,
    private readonly fileAssetHistoryEntityService: FileAssetHistoryEntityService,
    private readonly emailBlackListService: EmailBlackListService,
    private readonly databaseTransactionService: DatabaseTransactionService,
    private readonly acknowledgementTemplateEntityService: AcknowledgementTemplateEntityService,
    private readonly transactionCustomMessageTemplateEntityService: TransactionCustomMessageTemplateEntityService,
    private readonly applicationTypeNotificationEntityService: ApplicationTypeNotificationEntityService,
    private readonly notificationMessageInputEntityService: NotificationMessageInputEntityService,
    private readonly notificationMessageTemplateEntityService: NotificationMessageTemplateEntityService,
  ) {}

  @LogMethod({ keysToRedact: ['agencyPassword', 'customAgencyMessage'] })
  public async createFileTransaction(
    userId: number,
    fileTransactionReq: CreateFileTransactionV2Request,
    eserviceWhitelistedUser?: EserviceWhitelistedUser,
  ): Promise<CreateFileTransactionResponse> {
    let acknowledgementTemplateId: number | undefined;

    const {
      transaction: { type: transactionType, isAcknowledgementRequired, acknowledgementTemplateUuid, recipients: requestRecipients },
    } = fileTransactionReq;

    this.validateIfTransactionTypeIsUploadTransfer(transactionType);

    const { isCorporateRecipients } = this.validateIfMixedRecipients(requestRecipients);

    this.validateIfRecipientsHaveDuplicateIdentifier(requestRecipients, isCorporateRecipients);

    this.enforceAckIdAndIsAck(isAcknowledgementRequired, acknowledgementTemplateUuid);

    const user = await this.userEntityService.retrieveUserWithEserviceAndAgencyById(userId);

    if (acknowledgementTemplateUuid) {
      acknowledgementTemplateId = await this.retrieveAcknowledgmentTemplateId(acknowledgementTemplateUuid, user.eservices![0]);
    }

    const transactionInfo = await this.uploadTransferHandler(
      fileTransactionReq,
      user,
      eserviceWhitelistedUser,
      acknowledgementTemplateId,
      isCorporateRecipients,
    );

    const { transactionUuid, files, recipients } = transactionInfo;

    const filesObjForResponse: CreateTransactionFileResponse[] = files.map((file) => ({ name: file.name, uuid: file.fileAssetId }));

    const accessToken = await this.generateFileSessionAndFileUploadToken(user as ProgrammaticUser, transactionInfo);

    const fileTransactionResponse: CreateFileTransactionResponse = {
      accessToken,
      transactionUuid,
      files: filesObjForResponse,
      recipients,
    };

    // FOR PRODUCTION OPS SUPPORT
    const createTransactionResponseLog: CreateTransactionResponseLog[] = requestRecipients.map(
      ({ uin: requestRecipientUin, name, email }) => {
        const { activityUuid } = recipients.find(({ uin }) => uin === requestRecipientUin)!;
        return { activityUuid, name, email };
      },
    );

    this.logger.log(`${OPS_SUPPORT_CONTEXT} ${JSON.stringify(createTransactionResponseLog)}`);

    return fileTransactionResponse;
  }

  // ===========================================================================
  // Handlers
  // ===========================================================================
  @LogMethod({ keysToRedact: ['agencyPassword', 'customAgencyMessage', 'clientSecret', 'oaSigningKey'] })
  protected async uploadTransferHandler(
    transactionReq: CreateFileTransactionV2Request,
    user: User,
    eserviceWhitelistedUser?: EserviceWhitelistedUser,
    acknowledgementTemplateId?: number,
    isCorporateRecipients?: boolean,
  ): Promise<FileUploadTransactionInfo> {
    const { transaction: createTransactionReq, application: createApplicationReq, files } = transactionReq;
    const { recipients, isAcknowledgementRequired } = createTransactionReq;

    this.validateNoDuplicateFileNames(files);

    const recipientEmails: string[] = [];
    recipients.forEach(({ email }) => email && recipientEmails.push(email));
    await this.validateRecipientEmails(recipientEmails);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      // Create and save Transaction
      const transaction = await this.createTransactionByRequest(
        createTransactionReq,
        createApplicationReq,
        user,
        eserviceWhitelistedUser,
        isCorporateRecipients,
        entityManager,
      );

      // Create and save upload Activity
      const uploadActivity = await this.saveActivityForTxnCreation(
        ACTIVITY_TYPE.UPLOAD,
        transaction,
        user,
        undefined,
        undefined,
        entityManager,
      );

      // Create and save sendTransfer Activity
      const sendTransferActivity = await this.saveActivityForTxnCreation(
        ACTIVITY_TYPE.SEND_TRANSFER,
        transaction,
        user,
        uploadActivity,
        isAcknowledgementRequired,
        entityManager,
      );

      // Create and insert fileAssets required for upload and sendTransfer Activities
      const { result: insertSendTransferFileAssetsResult, uuids: sendTransferFileAssetUuids } = await this.insertFileAssetsForTxnCreation(
        files.map((file) => {
          return { fileInfo: file, ownerId: user.id, issuerId: user.id, type: FILE_ASSET_TYPE.UPLOADED };
        }),
        entityManager,
      );

      const sendTransferFileAssetIds = insertSendTransferFileAssetsResult.identifiers.map((identifier) => identifier.id);

      // Create and insert into activity_files table to join the upload and sendTranfer activities and their fileAssets
      const sendTransferActivityFileInserts: ActivityFileInsert[] = [];
      sendTransferFileAssetIds.forEach((fileAssetId) =>
        sendTransferActivityFileInserts.push(
          { activityId: uploadActivity.id, fileAssetId },
          { activityId: sendTransferActivity.id, fileAssetId },
        ),
      );
      await this.activityEntityService.insertActivityFiles(sendTransferActivityFileInserts, entityManager);

      // Create and insert fileAssetHistories required for fileAssets created above
      await this.fileAssetHistoryEntityService.insertFileAssetHistories(
        sendTransferFileAssetIds.map((id) => ({
          uuid: generateEntityUUID(FileAssetHistory.name),
          type: FILE_ASSET_ACTION.ISSUED,
          actionById: user.id,
          actionToId: user.id,
          fileAssetId: id,
        })),
        entityManager,
      );

      //  Create and insert new ghost user if existing user couldn't be found using uin
      const existingUsers = isCorporateRecipients
        ? await this.getOrCreateCorporateUser(recipients, entityManager)
        : await this.getOrCreateUser(recipients, entityManager);

      // Create and insert receiveTransfer activities and fileAssets
      const {
        receiveTransferFileAssetIds,
        fileAssetModels,
        recipients: recipientsWithActivityUuid,
      } = await this.createReceiveTransferActivitiesAndFilesForUsers(
        existingUsers,
        transaction,
        sendTransferActivity,
        files,
        user.id,
        sendTransferFileAssetIds,
        isAcknowledgementRequired,
        acknowledgementTemplateId,
        isCorporateRecipients,
        entityManager,
      );

      // Create and insert fileAssetHistories required for fileAssets created above
      await this.fileAssetHistoryEntityService.insertFileAssetHistories(
        receiveTransferFileAssetIds.map((id, index) => ({
          uuid: generateEntityUUID(FileAssetHistory.name),
          type: FILE_ASSET_ACTION.ISSUED,
          actionById: user.id,
          actionToId: fileAssetModels[index].ownerId,
          fileAssetId: id,
        })),
        entityManager,
      );

      await txn.commit();

      const fileInfos: FileInfo[] = files.map(
        ({ name, checksum, isPasswordEncryptionRequired, agencyPassword }, index): FileInfo => ({
          name,
          checksum,
          fileAssetId: sendTransferFileAssetUuids[index],
          isPasswordEncryptionRequired,
          ...(agencyPassword && {
            encryptedAgencyPassword: docEncryptionPasswordEncryptionTransformer.to(JSON.stringify(agencyPassword)) as string,
          }),
        }),
      );

      return {
        transactionUuid: transaction.uuid,
        creationMethod: transaction.creationMethod!, //TODO: creationMethod option for V1
        files: fileInfos,
        recipients: recipientsWithActivityUuid,
      };
    } catch (error) {
      await txn.rollback();
      this.logger.error(error);
      throw error;
    }
  }

  public async validateRecipientEmails(emails: string[]) {
    const blacklistedEmails: string[] = [];
    const uniqueEmails = Array.from(new Set(emails));

    const promises = uniqueEmails.map((email) => this.emailBlackListService.isEmailBlackListed(email));
    const results = await Promise.all(promises);

    results.forEach((isBlacklisted, index) => {
      if (isBlacklisted) {
        blacklistedEmails.push(uniqueEmails[index]);
      }
    });

    if (blacklistedEmails.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        {
          message: `The following email(s): ${blacklistedEmails.join(
            ', ',
          )} belong to a blacklist. Please provide an alternative email address for the above mentioned.`,
          blacklistedEmails,
        },
        undefined,
        EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED,
      );
    }
  }

  // ===========================================================================
  // Protected methods
  // ===========================================================================
  // agencyPassword is inside transactionInfo in plain. To redact if logging method
  protected validateNoDuplicateFileNames(files: AgencyFileUpload[]) {
    const fileNames = files.map((file) => file.name);
    const duplicatedFileNames = findDuplicateStrings(fileNames);

    if (duplicatedFileNames.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        {
          message: `The file names provided contain duplicates: ${duplicatedFileNames.join(
            ', ',
          )}. Please provide unique name for each file.`,
          duplicatedFileNames,
        },
        undefined,
        EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES,
      );
    }
  }

  protected async createTransactionByRequest(
    createTransactionRequest: CreateTransactionV2Request,
    createApplicationRequest: CreateApplicationRequest,
    user: User,
    eserviceWhitelistedUser?: EserviceWhitelistedUser,
    isCorporateRecipients?: boolean,
    entityManager?: EntityManager,
  ) {
    let application: Application | null;
    let applicationType: ApplicationType;

    const {
      name: transactionName,
      type: transactionType,
      creationMethod: transactionCreationMethod,
      customAgencyMessage: { transaction: transactionCustomMessage, notifications },
      recipients,
    } = createTransactionRequest;

    const { type: applicationTypeCodeFromRequest, externalRefId } = createApplicationRequest;
    const userEservice = user.eservices![0];

    try {
      applicationType = await this.applicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId(
        applicationTypeCodeFromRequest,
        userEservice.id,
        entityManager,
      );
    } catch (error) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, (error as Error).message);
    }

    const customMessage = await this.verifyAndGenerateCustomMessage(transactionCustomMessage, userEservice.agencyId);

    const notificationMessageInputsCreationModel = await this.verifyNotificationChannelAndTemplateAndSave(
      notifications,
      userEservice.agencyId,
      applicationType.id,
      recipients,
      isCorporateRecipients,
    );

    if (externalRefId) {
      application = await this.applicationEntityService.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
        externalRefId,
        userEservice.id,
        applicationType.id,
        { entityManager, toThrow: false },
      );

      if (!application) {
        await this.applicationEntityService.upsertApplication({ externalRefId, applicationType, eservice: userEservice }, entityManager);

        application = (await this.applicationEntityService.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
          externalRefId,
          userEservice.id,
          applicationType.id,
          { entityManager, toThrow: false },
        ))!; // Created from upsert, will always have application
      }
    } else {
      application = await this.applicationEntityService.saveApplication({ applicationType, eservice: userEservice }, entityManager);
    }

    const creationModel: TransactionCreationModel = {
      name: transactionName,
      type: transactionType,
      creationMethod: transactionCreationMethod ?? TRANSACTION_CREATION_METHOD.API,
      status: TRANSACTION_STATUS.INIT,
      fileSessionId: generateFileSessionUUID(),
      customMessage,
      application,
      user,
      eserviceWhitelistedUser,
    };

    const transaction = await this.transactionEntityService.saveTransaction(creationModel, entityManager);

    const notificationMessageInputs = notificationMessageInputsCreationModel.map(
      ({ notificationChannel, notificationMessageTemplate, templateInput, templateVersion }) =>
        this.notificationMessageInputEntityService.buildNotificationMessageInput({
          notificationChannel,
          notificationMessageTemplate,
          templateInput: templateInput ?? null,
          templateVersion,
          transaction,
        }),
    );

    await this.notificationMessageInputEntityService.saveNotificationMessageInputs(notificationMessageInputs, entityManager);

    return transaction;
  }

  protected async saveActivityForTxnCreation(
    type: ACTIVITY_TYPE,
    transaction: Transaction,
    user: User,
    parent?: Activity,
    isAcknowledgementRequired?: boolean,
    entityManager?: EntityManager,
  ) {
    return await this.activityEntityService.saveActivity(
      {
        status: ACTIVITY_STATUS.INIT,
        type,
        transaction,
        user,
        parent,
        isAcknowledgementRequired,
      },
      entityManager,
    );
  }

  @LogMethod({ keysToRedact: ['agencyPassword'] })
  protected async insertFileAssetsForTxnCreation(inserts: TxnCreationFileAssetInsert[], entityManager?: EntityManager) {
    const models = inserts.map(
      ({ fileInfo: { name, expiry, deleteAt, checksum, metadata }, ownerId, ownerMetadata, parentId, type, issuerId, oaCertificate }) => {
        const mergedMetadata = { ...metadata, ...ownerMetadata };

        return this.fileAssetEntityService.buildFileAsset({
          documentType: FILE_TYPE.UNKNOWN,
          status: FILE_STATUS.INIT,
          size: -1,
          metadata: Object.keys(mergedMetadata).length === 0 ? null : mergedMetadata,

          name,
          ownerId,
          type,
          parentId,
          expireAt: expiry ? new Date(expiry) : null,
          deleteAt: deleteAt ? new Date(deleteAt) : null,
          documentHash: checksum,
          issuerId,
          oaCertificate,
          lastViewedAt: null,
        });
      },
    );

    const result = await this.fileAssetEntityService.insertFileAssets(models, entityManager);
    const uuids = models.map((model) => model.uuid);
    return { result, uuids };
  }

  @LogMethod()
  protected async getOrCreateUser(recipients: CreateRecipientV2Request[], entityManager?: EntityManager) {
    const existingUsers: { [key: number]: CreateRecipientV2Request } = {};
    const usersToBeInserted: CitizenUserCreationModel[] = [];
    const recipientInfoOfUsersToBeInserted: CreateRecipientV2Request[] = [];

    for (const recipient of recipients) {
      let activityUser = (await this.userEntityService.retrieveUserByUin(recipient.uin!, { toThrow: false })) as CitizenUser | null;

      if (!activityUser) {
        this.logger.log(`Creating new user account for user ${maskUin(recipient.uin!)}`);
        activityUser = this.citizenUserEntityService.buildCitizenUser({ uin: recipient.uin!, status: STATUS.ACTIVE });
        usersToBeInserted.push(activityUser);
        recipientInfoOfUsersToBeInserted.push(recipient);
      } else {
        existingUsers[activityUser.id] = recipient;
      }
    }

    if (usersToBeInserted.length > 0) {
      const recipientUsersInsertResult = await this.citizenUserEntityService.insertCitizenUsers(usersToBeInserted, entityManager);

      recipientUsersInsertResult.identifiers.forEach(
        (identifier, index) => (existingUsers[identifier.id] = recipientInfoOfUsersToBeInserted[index]),
      );
    }

    return existingUsers;
  }

  protected async getOrCreateCorporateUser(recipients: CreateRecipientV2Request[], entityManager?: EntityManager) {
    const existingUsers: { [key: number]: CreateRecipientV2Request } = {};
    const corporatesToBeCreated: CorporateWithBaseUserCreationModel[] = [];
    const recipientInfoOfUsersToBeInserted: CreateRecipientV2Request[] = [];

    for (const recipient of recipients) {
      const recipientUen = recipient.uen!;

      let corporate = await this.corporateEntityService.retrieveCorporateWithBaseUserByUen(recipientUen, { toThrow: false });

      if (!corporate) {
        this.logger.log(`Creating new corporate for ${recipientUen}`);
        corporate = this.corporateEntityService.buildCorporateWithBaseUser({ uen: recipientUen, user: { status: STATUS.ACTIVE } });
        corporatesToBeCreated.push(corporate as CorporateWithBaseUserCreationModel); // gd TODO: typings to be fixed
        recipientInfoOfUsersToBeInserted.push(recipient);
      } else {
        existingUsers[corporate.user!.id] = recipient;
      }
    }

    if (corporatesToBeCreated.length > 0) {
      const corporates = await this.corporateEntityService.saveCorporatesWithBaseUsers(corporatesToBeCreated, entityManager);
      corporates.forEach(({ user }, index) => (existingUsers[user!.id] = recipientInfoOfUsersToBeInserted[index]));
    }

    return existingUsers;
  }

  @LogMethod({ keysToRedact: ['agencyPassword', 'customAgencyMessage', 'oaSigningKey', 'clientSecret'] })
  protected async createReceiveTransferActivitiesAndFilesForUsers(
    existingUsers: { [key: number]: CreateRecipientV2Request },
    transaction: Transaction,
    parentActivity: Activity,
    files: AgencyFileUpload[],
    fileAssetIssuerId: number,
    sendTransferFileAssetIds: number[],
    isAcknowledgementRequired?: boolean,
    acknowledgementTemplateId?: number,
    isCorporateRecipients?: boolean,
    entityManager?: EntityManager,
  ) {
    const receiveTransferActivityModels: ActivityCreationModel[] = [];
    const fileAssetModels: TxnCreationFileAssetInsert[] = [];
    const filesLength = files.length;
    const recipients: CreateFileTransactionRecipientResponse[] = [];

    for (const [id, createRecipientRequest] of Object.entries(existingUsers)) {
      const userId = parseInt(id, 10);
      const { name, dob, contact, email, isNonSingpassRetrievable, emails } = createRecipientRequest;

      const recipientInfo: ActivityRecipientInfo = { name, ...(!isCorporateRecipients && { failedAttempts: 0 }) };

      if (email) {
        recipientInfo.email = email;
      }

      if (dob) {
        recipientInfo.dob = dob;
      }

      if (contact) {
        recipientInfo.mobile = contact;
      }

      if (emails) {
        recipientInfo.emails = emails;
      }

      /**
       * By default insertActivities function is already doing buildActivity internally, theres no need to buildActivity manually.
       * However, due to the fact that in this handler theres a need to obtain the activityUuid beforehand, and to avoid additional db call
       * to obtain the inserted activities, so doing buildActivity here instead.
       */
      const activity = this.activityEntityService.buildActivity({
        status: ACTIVITY_STATUS.INIT,
        type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
        transaction,
        parent: parentActivity,
        recipientInfo,
        userId,
        isAcknowledgementRequired,
        acknowledgementTemplateId,
        isNonSingpassRetrievable,
      });

      receiveTransferActivityModels.push(activity);
      recipients.push({ uin: createRecipientRequest.uin!, activityUuid: activity.uuid });

      for (let i = 0; i < filesLength; i++) {
        fileAssetModels.push({
          fileInfo: files[i],
          ownerId: userId,
          ownerMetadata: createRecipientRequest.metadata ?? {},
          issuerId: fileAssetIssuerId,
          parentId: sendTransferFileAssetIds[i],
          type: FILE_ASSET_TYPE.TRANSFERRED,
        });
      }
    }

    const receiveTransferActivitiesInsertResult = await this.activityEntityService.insertActivities(
      receiveTransferActivityModels,
      entityManager,
    );
    const { result: receiveTransferFileAssetsInsertResult } = await this.insertFileAssetsForTxnCreation(fileAssetModels, entityManager);
    this.logger.log(
      `[createReceiveTransferActivitiesAndFilesForUsers] Created receive transfer activities for recipients ${redactUinfin(
        JSON.stringify(recipients),
      )} under transactionUuid ${transaction.uuid}`,
    );
    const receiveTransferActivitiesIds = receiveTransferActivitiesInsertResult.identifiers.map((identifier) => identifier.id);
    const receiveTransferFileAssetIds = receiveTransferFileAssetsInsertResult.identifiers.map((identifier) => identifier.id);

    // Create and insert into activity_files table to join the receiveTransfer activities and their fileAssets
    const receiveTransferActivityFileInserts: ActivityFileInsert[] = [];

    for (let i = 0; i < receiveTransferActivitiesIds.length; i++) {
      const initial = i * filesLength;
      const limit = initial + filesLength;

      for (let j = initial; j < limit; j++) {
        receiveTransferActivityFileInserts.push({
          activityId: receiveTransferActivitiesIds[i],
          fileAssetId: receiveTransferFileAssetIds[j],
        });
      }
    }
    await this.activityEntityService.insertActivityFiles(receiveTransferActivityFileInserts, entityManager);

    return { receiveTransferFileAssetIds, fileAssetModels, recipients };
  }

  // agencyPassword is inside transactionInfo in plain. To redact if logging method
  protected generateFileUploadInfo(programmaticUser: ProgrammaticUser, transactionInfo: FileUploadTransactionInfo) {
    const userAgency = programmaticUser.eservices![0].agency!;
    const { name, code, identityProofLocation, oaSigningKey } = userAgency;

    return {
      userUuid: programmaticUser.uuid,
      agencyInfo: {
        name,
        code,
        identityProofLocation,
        sk: oaSigningKey,
      },
      transactionInfo,
    };
  }

  @LogMethod()
  protected async generateFileUploadJwt(transactionUuid: string): Promise<string> {
    const payload: Omit<FileUploadJwtPayload, 'type'> = {
      transactionUuid,
    };

    const expiresIn = this.fileSGConfigService.authConfig.jwtAccessTokenExpirationDuration;

    return await this.authService.generateJWT(payload, JWT_TYPE.FILE_UPLOAD, { expiresIn });
  }

  protected validateIfRecipientsHaveDuplicateIdentifier(recipients: CreateRecipientV2Request[], isCorporateRecipients?: boolean) {
    const identifier = isCorporateRecipients ? 'uen' : 'uin';

    // Check for duplicate recipient uin
    const recepientIdentifiers = recipients.map((recipient) => recipient[identifier]!);
    const duplicatedIdentifiers = findDuplicateStrings(recepientIdentifiers);

    if (duplicatedIdentifiers.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        {
          message: `The recipient ${identifier}s provided contain duplicates: ${duplicatedIdentifiers.join(
            ', ',
          )}. Please provide unique ${identifier} for each recipient.`,
          duplicatedUins: duplicatedIdentifiers,
        },
        undefined,
        isCorporateRecipients ? EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UENS : EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS,
      );
    }
  }

  protected enforceAckIdAndIsAck(isAcknowledgementRequired?: boolean, acknowledgementTemplateUuid?: string) {
    if (acknowledgementTemplateUuid && !isAcknowledgementRequired) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        `Property 'acknowledgementTemplateUuid' is not allowed when property 'isAcknowledgementRequired' is false or undefined.`,
      );
    }
  }

  protected async retrieveAcknowledgmentTemplateId(acknowledgementTemplateUuid: string, { name: eserviceName, id: eserviceId }: Eservice) {
    const acknowledgementTemplate = await this.acknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid(
      acknowledgementTemplateUuid,
      { toThrow: false },
    );

    // reading user's eservice by index 0 because it is a programmatic user
    if (!acknowledgementTemplate || acknowledgementTemplate.eserviceId !== eserviceId) {
      const internalLog = `Acknowledge template of uuid ${acknowledgementTemplateUuid} is either does not exist or does not belongs to the eservice - ${eserviceName}`;

      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        `Acknowledge template of uuid ${acknowledgementTemplateUuid} does not exist`,
        internalLog,
      );
    }

    return acknowledgementTemplate.id;
  }

  protected async generateFileSessionAndFileUploadToken(programmaticUser: ProgrammaticUser, transactionInfo: FileUploadTransactionInfo) {
    this.logger.log(`Creating access token for user: ${programmaticUser.uuid}`);
    const fileUploadInfo = this.generateFileUploadInfo(programmaticUser, transactionInfo);
    const timeToLive = this.fileSGConfigService.redisConfig.fileUploadTtlInSeconds;
    await this.redisService.set(
      FILESG_REDIS_CLIENT.FILE_SESSION,
      `${FILESG_REDIS_NAMESPACE.FILE_UPLOAD_INFO}:${transactionInfo.transactionUuid}`,
      JSON.stringify(fileUploadInfo),
      undefined,
      timeToLive,
    );

    return await this.generateFileUploadJwt(transactionInfo.transactionUuid);
  }

  protected validateIfTransactionTypeIsUploadTransfer(transactionType: TRANSACTION_TYPE) {
    // TODO: temporarily use if instead of switch as there is only one transactionType, can switch in the future
    if (transactionType !== TRANSACTION_TYPE.UPLOAD_TRANSFER) {
      throw new UnsupportedTransactionTypeException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, transactionType);
    }
  }

  protected validateIfMixedRecipients(requestRecipients: CreateRecipientV2Request[]) {
    const citizenRecipients = requestRecipients.filter(({ type }) => !type || type === RECIPIENT_TYPE.CITIZEN);
    const corporateRecipients = requestRecipients.filter(({ type }) => type === RECIPIENT_TYPE.CORPORATE);

    if (citizenRecipients.length > 0 && corporateRecipients.length > 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        'Mixing of citizen and corporate recipients are not allowed.',
      );
    }

    return { isCorporateRecipients: corporateRecipients.length > 0 };
  }

  protected async verifyAndGenerateCustomMessage({ templateId, templateInput }: MessageTemplate, agencyId: number): Promise<string[]> {
    const transactionTemplate = await this.transactionCustomMessageTemplateEntityService.retrieveTransactionCustomMessageTemplate(
      templateId,
      agencyId,
    );

    if (!transactionTemplate) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Invalid transaction templateId');
    }

    templateInput ??= {};

    this.validateAndCompareArrays<string>(
      transactionTemplate.requiredFields ?? undefined,
      Object.keys(templateInput),
      `For transactionId: ${transactionTemplate.uuid} encountered the following issues.`,
    );

    return generateOutputFromTemplate<string[]>(transactionTemplate.template, templateInput ?? null).filter((value) => !!value);
  }

  protected async verifyNotificationChannelAndTemplateAndSave(
    notificationMessages: NotificationMessage[],
    agencyId: number,
    applicationId: number,
    recipients: CreateRecipientV2Request[],
    isCorporateRecipients?: boolean,
  ): Promise<PartialNotificationMessageInputCreation[]> {
    let notificationChannelsForApplication: NOTIFICATION_CHANNEL[];

    const applicationTypeNotifications = await this.applicationTypeNotificationEntityService.retrieveNotificationChannelsForApplicationType(
      applicationId,
    );

    if (isCorporateRecipients) {
      const sgNotifyChannel = notificationMessages.find((message) => message.channel === NOTIFICATION_CHANNEL.SG_NOTIFY);

      if (sgNotifyChannel) {
        throw new InputValidationException(
          COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
          `Notification channel ${NOTIFICATION_CHANNEL.SG_NOTIFY} is not supported for corporate type of recipients`,
        );
      }

      notificationChannelsForApplication = applicationTypeNotifications
        .filter(({ notificationChannel }) => notificationChannel !== NOTIFICATION_CHANNEL.SG_NOTIFY)
        .map(({ notificationChannel }) => notificationChannel);
    } else {
      notificationChannelsForApplication = applicationTypeNotifications.map(({ notificationChannel }) => notificationChannel);
    }

    const notificationChannelsFromTransaction = notificationMessages.map(({ channel }) => channel);

    this.validateAndCompareArrays<NOTIFICATION_CHANNEL>(
      notificationChannelsForApplication,
      notificationChannelsFromTransaction,
      `Invalid notification channels for application type.`,
    );

    const notificationMessageInputs: PartialNotificationMessageInputCreation[] = [];

    const recipientsWithNoNotificationMedium = recipients.map((recipient) => recipient.name);
    const requiredFieldsForNotification = new Set<string>();

    for (let x = 0; x < notificationMessages.length; x++) {
      const { templateId, channel, templateInput } = notificationMessages[x];
      const notificationTemplate =
        await this.notificationMessageTemplateEntityService.retrieveNotificationTemplateUsingUuidAgencyIdAndNotificationChannel(
          templateId,
          agencyId,
          channel,
        );

      if (!notificationTemplate) {
        throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, `Invalid template id: ${templateId}`);
      }

      this.validateAndCompareArrays<string>(
        notificationTemplate.requiredFields ?? undefined,
        Object.keys(templateInput ?? {}),
        `For notification templateId: ${templateId} encountered the following issues.`,
      );

      const requiredFieldInRecipient =
        REQUIRED_RECIPIENT_FIELD_FOR_NOTIFICATION[channel][isCorporateRecipients ? RECIPIENT_TYPE.CORPORATE : RECIPIENT_TYPE.CITIZEN];

      requiredFieldsForNotification.add(requiredFieldInRecipient!);

      recipients.forEach((recipient) => {
        if (recipient[requiredFieldInRecipient!]) {
          const indexOfRecipient = recipientsWithNoNotificationMedium.indexOf(recipient.name);

          if (indexOfRecipient >= 0) {
            recipientsWithNoNotificationMedium.splice(indexOfRecipient, 1);
          }
        }
      });

      notificationMessageInputs.push({
        notificationChannel: channel,
        templateVersion: notificationTemplate.version,
        templateInput: templateInput ?? null,
        notificationMessageTemplate: notificationTemplate,
      });
    }

    if (recipientsWithNoNotificationMedium.length > 0) {
      const missingRecipients = recipientsWithNoNotificationMedium.join(', ');
      const missingFields = Array.from(requiredFieldsForNotification).join(', ');
      const errorMsg = `The following recipients: [${missingRecipients}] are missing the required field(s) for notification. Please provide at least one of the following fields: [${missingFields}].`;
      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, errorMsg);
    }

    return notificationMessageInputs;
  }

  protected validateAndCompareArrays<T>(arrayToCompare: T[] = [], arrayToCompareWith: T[] = [], customErrorMessage: string) {
    const { isEqual, missingElements, additionalElements } = compareArrays<T>(arrayToCompare, arrayToCompareWith);

    if (!isEqual) {
      if (missingElements.length) {
        customErrorMessage += ` Missing fields [${missingElements.join(',')}].`;
      }

      if (additionalElements.length) {
        customErrorMessage += ` Invalid fields [${additionalElements.join(',')}].`;
      }

      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, customErrorMessage);
    }
  }
}
