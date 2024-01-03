import { FileUploadJwtPayload, InputValidationException, JWT_TYPE, LogMethod, maskUin, OPS_SUPPORT_CONTEXT } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  CreateFileTransactionRecipientResponse,
  CreateFileTransactionResponse,
  CreateTransactionFileResponse,
  FILE_ASSET_ACTION,
  FILE_STATUS,
  FILE_TYPE,
  FileInfo,
  FileUploadTransactionInfo,
  Metadata,
  redactUinfin,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  USER_TYPE,
} from '@filesg/common';
import {
  AgencyFileUpload,
  CreateApplicationRequest,
  CreateFileTransactionRequest,
  CreateRecipientRequest,
  CreateTransactionRequest,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, FILESG_REDIS_NAMESPACE, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import {
  DuplicateFileNameException,
  EmailInBlackListException,
  UnsupportedTransactionTypeException,
} from '../../../common/filters/custom-exceptions.filter';
import { Activity, ActivityCreationModel } from '../../../entities/activity';
import { Application } from '../../../entities/application';
import { ApplicationType } from '../../../entities/application-type';
import { FileAssetHistory } from '../../../entities/file-asset-history';
import { OACertificate } from '../../../entities/oa-certificate';
import { Transaction, TransactionCreationModel } from '../../../entities/transaction';
import { CitizenUser, CitizenUserCreationModel, ProgrammaticUser, User } from '../../../entities/user';
import { ActivityRecipientInfo, CreateTransactionResponseLog, FILE_ASSET_TYPE } from '../../../typings/common';
import { docEncryptionPasswordEncryptionTransformer } from '../../../utils/encryption';
import { generateEntityUUID, generateFileSessionUUID } from '../../../utils/helpers';
import { AcknowledgementTemplateEntityService } from '../../entities/acknowledgement-template/acknowledgement-template.entity.service';
import { ActivityFileInsert } from '../../entities/activity/activity.entity.repository';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { ApplicationEntityService } from '../../entities/application/application.entity.service';
import { ApplicationTypeEntityService } from '../../entities/application-type/application-type.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { FileAssetHistoryEntityService } from '../../entities/file-asset-history/file-asset-history.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';
import { CitizenUserEntityService } from '../../entities/user/citizen-user.entity.service';
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
export class FileTransactionService {
  private readonly logger = new Logger(FileTransactionService.name);

  constructor(
    private readonly userEntityService: UserEntityService,
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
  ) {}

  @LogMethod({ keysToRedact: ['agencyPassword', 'customAgencyMessage'] })
  public async createFileTransaction(
    userId: number,
    fileTransactionReq: CreateFileTransactionRequest,
  ): Promise<CreateFileTransactionResponse> {
    const { transaction } = fileTransactionReq;

    const { type: transactionType, isAcknowledgementRequired, acknowledgementTemplateUuid, recipients: requestRecipients } = transaction;

    // Check for duplicate recipient uin
    const recepientsUins = requestRecipients.map((recipients) => recipients.uin);

    if (recepientsUins.length !== new Set(recepientsUins).size) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Duplicate recipients UINs');
    }

    if (acknowledgementTemplateUuid && !isAcknowledgementRequired) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        `Property 'acknowledgementTemplateUuid' is not allowed when property 'isAcknowledgementRequired' is false or undefined.`,
      );
    }

    const user = await this.userEntityService.retrieveUserWithEserviceAndAgencyById(userId);

    let acknowledgementTemplateId: number | undefined = undefined;

    if (acknowledgementTemplateUuid) {
      const acknowledgementTemplate = await this.acknowledgementTemplateEntityService.retrieveAcknowledgementTemplateByUuid(
        acknowledgementTemplateUuid,
        { toThrow: false },
      );

      // reading user's eservice by index 0 because it is a programmatic user
      if (!acknowledgementTemplate || acknowledgementTemplate.eserviceId !== user.eservices![0].id) {
        const internalLog = `Acknowledge template of uuid ${acknowledgementTemplateUuid} is either does not exist or does not belongs to the eservice - ${
          user.eservices![0].name
        }`;

        throw new InputValidationException(
          COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
          `Acknowledge template of uuid ${acknowledgementTemplateUuid} does not exist`,
          internalLog,
        );
      }

      acknowledgementTemplateId = acknowledgementTemplate.id;
    }

    let accessToken = null;

    // TODO: temporarily use if instead of switch as there is only one transactionType, can switch in the future
    if (transactionType !== TRANSACTION_TYPE.UPLOAD_TRANSFER) {
      throw new UnsupportedTransactionTypeException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, transactionType);
    }

    const transactionInfo = await this.uploadTransferHandler(fileTransactionReq, user, acknowledgementTemplateId);
    const { transactionUuid, files, recipients } = transactionInfo;

    const filesObjForResponse: CreateTransactionFileResponse[] = files.map((file) => {
      return { name: file.name, uuid: file.fileAssetId };
    });

    if (user.type === USER_TYPE.PROGRAMMATIC) {
      this.logger.log(`Creating access token for user: ${user.uuid}`);
      const fileUploadInfo = this.generateFileUploadInfo(user as ProgrammaticUser, transactionInfo);
      const timeToLive = this.fileSGConfigService.redisConfig.fileUploadTtlInSeconds;
      await this.redisService.set(
        FILESG_REDIS_CLIENT.FILE_SESSION,
        `${FILESG_REDIS_NAMESPACE.FILE_UPLOAD_INFO}:${transactionUuid}`,
        JSON.stringify(fileUploadInfo),
        undefined,
        timeToLive,
      );

      accessToken = await this.generateFileUploadJwt(transactionUuid);
    }

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
  protected async uploadTransferHandler(transactionReq: CreateFileTransactionRequest, user: User, acknowledgementTemplateId?: number) {
    const { transaction: createTransactionReq, application: createApplicationReq, files } = transactionReq;
    const { recipients, isAcknowledgementRequired } = createTransactionReq;

    this.validateNoDuplicateFileNames(files);
    await this.validateRecipientEmails(recipients);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      // Create and save Transaction
      const transaction = await this.createTransactionByRequest(createTransactionReq, createApplicationReq, user, entityManager);

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
      const existingUsers = await this.getOrCreateUser(recipients, entityManager);

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
        files: fileInfos,
        recipients: recipientsWithActivityUuid,
      };
    } catch (error) {
      await txn.rollback();
      this.logger.error(error);
      throw error;
    }
  }

  // ===========================================================================
  // Protected methods
  // ===========================================================================
  // agencyPassword is inside transactionInfo in plain. To redact if logging method
  protected validateNoDuplicateFileNames(files: AgencyFileUpload[]) {
    const fileNames = files.map((file) => file.name);
    if (fileNames.length !== new Set(fileNames).size) {
      throw new DuplicateFileNameException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE);
    }
  }

  protected async validateRecipientEmails(recipients: CreateRecipientRequest[]) {
    const blackListedEmails: string[] = [];
    for (const { email } of recipients) {
      if (email && (await this.emailBlackListService.isEmailBlackListed(email))) {
        blackListedEmails.push(email);
      }
    }

    if (blackListedEmails.length > 0) {
      throw new EmailInBlackListException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, blackListedEmails);
    }
  }

  protected async createTransactionByRequest(
    createTransactionRequest: CreateTransactionRequest,
    createApplicationRequest: CreateApplicationRequest,
    user: User,
    entityManager?: EntityManager,
  ) {
    const { name: transactionName, type: transactionType, customAgencyMessage } = createTransactionRequest;
    const { type: applicationTypeCodeFromRequest, externalRefId } = createApplicationRequest;

    let application: Application | null;
    const userEservice = user.eservices![0];

    let applicationType: ApplicationType;
    try {
      applicationType = await this.applicationTypeEntityService.retrieveApplicationTypeByCodeAndEserviceId(
        applicationTypeCodeFromRequest,
        userEservice.id,
        entityManager,
      );
    } catch (error) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, error);
    }

    if (externalRefId) {
      application = await this.applicationEntityService.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
        externalRefId,
        userEservice.id,
        applicationType.id,
        { entityManager, toThrow: false },
      );

      if (!application) {
        application = await this.applicationEntityService.saveApplication(
          { externalRefId, applicationType, eservice: userEservice },
          entityManager,
        );
      }
    } else {
      application = await this.applicationEntityService.saveApplication({ applicationType, eservice: userEservice }, entityManager);
    }

    const creationModel: TransactionCreationModel = {
      name: transactionName,
      type: transactionType,
      creationMethod: TRANSACTION_CREATION_METHOD.API,
      status: TRANSACTION_STATUS.INIT,
      fileSessionId: generateFileSessionUUID(),
      customAgencyMessage: customAgencyMessage,
      application,
      user,
    };

    return await this.transactionEntityService.saveTransaction(creationModel, entityManager);
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
        });
      },
    );

    const result = await this.fileAssetEntityService.insertFileAssets(models, entityManager);
    const uuids = models.map((model) => model.uuid);
    return { result, uuids };
  }

  @LogMethod()
  protected async getOrCreateUser(recipients: CreateRecipientRequest[], entityManager?: EntityManager) {
    const existingUsers: { [key: number]: CreateRecipientRequest } = {};
    const usersToBeInserted: CitizenUserCreationModel[] = [];
    const recipientInfoOfUsersToBeInserted: CreateRecipientRequest[] = [];

    for (const recipient of recipients) {
      let activityUser = (await this.userEntityService.retrieveUserByUin(recipient.uin, { toThrow: false })) as CitizenUser | null;

      if (!activityUser) {
        this.logger.log(`Creating new user account for user ${maskUin(recipient.uin)}`);
        activityUser = this.citizenUserEntityService.buildCitizenUser({ uin: recipient.uin, status: STATUS.ACTIVE });
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

  @LogMethod({ keysToRedact: ['agencyPassword', 'customAgencyMessage', 'oaSigningKey', 'clientSecret'] })
  protected async createReceiveTransferActivitiesAndFilesForUsers(
    existingUsers: { [key: number]: CreateRecipientRequest },
    transaction: Transaction,
    parentActivity: Activity,
    files: AgencyFileUpload[],
    fileAssetIssuerId: number,
    sendTransferFileAssetIds: number[],
    isAcknowledgementRequired?: boolean,
    acknowledgementTemplateId?: number,
    entityManager?: EntityManager,
  ) {
    const receiveTransferActivityModels: ActivityCreationModel[] = [];
    const fileAssetModels: TxnCreationFileAssetInsert[] = [];
    const filesLength = files.length;
    const recipients: CreateFileTransactionRecipientResponse[] = [];

    for (const [id, createRecipientRequest] of Object.entries(existingUsers)) {
      const userId = parseInt(id, 10);
      const { name, dob, contact, email } = createRecipientRequest;

      const recipientInfo: ActivityRecipientInfo = { name, failedAttempts: 0 };

      if (email) {
        recipientInfo.email = email;
      }

      if (dob) {
        recipientInfo.dob = dob;
      }

      if (contact) {
        recipientInfo.mobile = contact;
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
        isNonSingpassRetrievable: true, // v1 endpoint service always set to true as its only apply to ICA
      });

      receiveTransferActivityModels.push(activity);
      recipients.push({ uin: createRecipientRequest.uin, activityUuid: activity.uuid, isNonSingpassRetrievable: true });

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
}
