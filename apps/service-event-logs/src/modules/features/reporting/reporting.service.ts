import { Application, FORMSG_PROCESS_FAIL_TYPE, FORMSG_TRANSACTION_FAIL_TYPE, RESULT_STATUS } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { json2csv } from 'json-2-csv';

import { MissingReportDetailsException, UnknownFormSgTransactionResultException } from '../../../common/filters/custom-exceptions.filter';
import { EmailNotificationInfo, FormSgTransaction, SgNotifyNotificationInfo, Transaction } from '../../../entities/formsg-transaction';
import { FormSgTransactionEntityService } from '../../entities/formsg-transaction/formsg-transaction.entity.service';

export interface FormSgIssuanceRecord {
  Index: string;
  'FormSg Response Id': string;
  'Application Type': string;
  'Agency Reference Id': string;
  'Transaction Uuid': string;
  'Transaction Name': string;
  'Recipient Activity Uuid': string;
  'Recipient Masked Uin': string;
  'Recipient Name': string;
  'Recipient Email': string;
  'Recipient Dob': string;
  'Recipient Contact': string;
  'Is Non Singpass Retrievable': boolean;
  'Agency File Asset Uuid': string;
  'Agency File Asset Name': string;
  'Agency File Asset Delete At': string;
  'Transaction Status': string;
  Error: string;
  'Failure Reason'?: string;
  'Notification Failure Reason'?: string;
}

export interface FormSgIssuanceRecordContent {
  index: string;
  formSgSubmissionId: string;
  applicationType?: string;
  applicationExternalRefId?: string;
  transactionUuid?: string;
  transactionName?: string;
  recipientActivityUuid?: string;
  recipientMaskedUin?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientDob?: string;
  recipientContact?: string;
  isNonSingpassRetrievable?: boolean;
  agencyFileAssetUuid?: string;
  agencyFileAssetName?: string;
  agencyFileAssetDeleteAt?: string;
  transactionStatus: RESULT_STATUS;
  failSubType?: string;
  failureReason?: string;
  notificationFailureReason?: string;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(private readonly formSgTransactionEntityService: FormSgTransactionEntityService) {}

  public async generateFormSgIssuanceReport(id: string, excludeFailureDetails?: boolean) {
    const fileName = `formsg-issuance.csv`;
    const transactionsToProcess: FormSgTransaction[] = [];

    const formsgTransaction = await this.formSgTransactionEntityService.findFormSgTransaction({ id }, true);
    const { batchSize } = formsgTransaction;

    if (batchSize) {
      const batchTransactions = await this.formSgTransactionEntityService.findFormSgBatchTransactionsByBatchId(id);
      transactionsToProcess.push(...batchTransactions);
    } else {
      transactionsToProcess.push(formsgTransaction);
    }

    const report = this.generateFormSgIssuanceRecords(transactionsToProcess, id, excludeFailureDetails);

    const csvData = await json2csv(report, { prependHeader: true });
    return { fileName, mimeType: 'text/csv', csvData };
  }

  protected generateFormSgIssuanceRecords(
    transactions: FormSgTransaction[],
    formSubmissionId: string,
    excludeFailureDetails?: boolean,
  ): FormSgIssuanceRecord[] {
    const report: FormSgIssuanceRecord[] = [];

    transactions.forEach((transaction, index) => {
      const { result } = transaction;
      switch (result) {
        case RESULT_STATUS.SUCCESS: {
          report.push(...this.generateFormSgIssuanceSuccessReport(transaction, formSubmissionId, index + 1, excludeFailureDetails));
          break;
        }
        case RESULT_STATUS.FAILURE: {
          report.push(...this.generateFormSgIssuanceFailureReport(transaction, formSubmissionId, index + 1, excludeFailureDetails));
          break;
        }
        default: {
          throw new UnknownFormSgTransactionResultException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, formSubmissionId);
        }
      }
    });

    return report;
  }

  protected generateFormSgIssuanceSuccessReport(
    formsgTransaction: FormSgTransaction,
    id: string,
    index: number,
    excludeFailureDetails?: boolean,
  ): FormSgIssuanceRecord[] {
    const { application, transaction, notificationsSent } = formsgTransaction;

    if (!transaction || !application) {
      throw new MissingReportDetailsException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, id);
    }

    return this.generateFormSgIssuanceTransactionRecords(
      id,
      transaction,
      application,
      index,
      RESULT_STATUS.SUCCESS,
      undefined,
      undefined,
      notificationsSent,
      excludeFailureDetails,
    );
  }

  protected generateFormSgIssuanceFailureReport(
    formsgTransaction: FormSgTransaction,
    id: string,
    index: number,
    excludeFailureDetails?: boolean,
  ): FormSgIssuanceRecord[] {
    const { application, transaction, failType, failSubType, failedReason } = formsgTransaction;

    switch (failType) {
      case FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT:
      case FORMSG_PROCESS_FAIL_TYPE.OTHERS: {
        return [
          this.generateFormSgIssuanceCsvRecord(
            {
              formSgSubmissionId: id,
              index: `${index}`,
              transactionStatus: RESULT_STATUS.FAILURE,
              failureReason: failedReason,
            },
            excludeFailureDetails,
          ),
        ];
      }

      case FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN:
      case FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD:
      case FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN:
      case FORMSG_TRANSACTION_FAIL_TYPE.OTHERS: {
        if (!transaction || !application) {
          throw new MissingReportDetailsException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, id);
        }

        return this.generateFormSgIssuanceTransactionRecords(
          id,
          transaction,
          application,
          index,
          RESULT_STATUS.FAILURE,
          failSubType,
          failedReason,
          undefined,
          excludeFailureDetails,
        );
      }

      default: {
        return [];
      }
    }
  }

  protected generateFormSgIssuanceTransactionRecords(
    formSgSubmissionId: string,
    transaction: Transaction,
    application: Application,
    index: number,
    transactionStatus: RESULT_STATUS,
    failSubType?: string,
    failureReason?: string,
    notificationsSent?: (EmailNotificationInfo | SgNotifyNotificationInfo)[],
    excludeFailureDetails?: boolean,
  ): FormSgIssuanceRecord[] {
    const { agencyFileAssets, recipientActivities } = transaction;

    const records: FormSgIssuanceRecord[] = [];
    const isFailureAtFileAssetLevel = agencyFileAssets.some((fileAsset) => !!fileAsset.failedReason);
    const isFailureAtActivityLevel = recipientActivities.some((activity) => !!activity.failedReason);

    const recipientActivityUuidToNotificationFailureMap = notificationsSent?.reduce<
      Record<string, { failSubType: string | undefined; failedReason: string | undefined }>
    >((acc, cur) => {
      const { recipientActivityUuid, failSubType, failedReason } = cur;

      if (!acc[recipientActivityUuid]) {
        acc[recipientActivityUuid] = { failSubType, failedReason };
        return acc;
      }

      acc[recipientActivityUuid].failSubType = acc[recipientActivityUuid].failSubType + `, ${failSubType}`;
      acc[recipientActivityUuid].failedReason = acc[recipientActivityUuid].failedReason + `, ${failedReason}`;

      return acc;
    }, {});

    recipientActivities.forEach(
      ({
        uuid: recipientActivityUuid,
        name: recipientName,
        maskedUin: recipientMaskedUin,
        email: recipientEmail,
        dob: recipientDob,
        contact: recipientContact,
        isNonSingpassRetrievable,
        failSubType: recipientActivityFailSubType,
        failedReason: recipientActivityFailedReason,
      }) => {
        agencyFileAssets.forEach(
          ({
            uuid: agencyFileAssetUuid,
            name: agencyFileAssetName,
            failSubType: agencyFileAssetFailSubType,
            failedReason: agencyFileAssetFailedReason,
            deleteAt: agencyFileAssetDeleteAt,
          }) => {
            let subType;
            let reason;

            // when file asset has fail reason, use its own sub type, other file asset shud have empty sub type
            // else if activity has fail reason, use its own sub type, other file asset shud have empty sub type
            // else all file asset use general fail reason and sub type
            if (isFailureAtFileAssetLevel) {
              if (agencyFileAssetFailedReason) {
                subType = agencyFileAssetFailSubType;
                reason = agencyFileAssetFailedReason;
              }
            } else if (isFailureAtActivityLevel) {
              if (recipientActivityFailedReason) {
                subType = recipientActivityFailSubType;
                reason = recipientActivityFailedReason;
              }
            } else if (recipientActivityUuidToNotificationFailureMap) {
              subType = recipientActivityUuidToNotificationFailureMap[recipientActivityUuid!].failSubType;
            } else {
              subType = failSubType;
              reason = failureReason;
            }

            const data = this.generateFormSgIssuanceCsvRecord(
              {
                index: `${index}`,
                formSgSubmissionId,
                applicationType: application.type,
                applicationExternalRefId: application.externalRefId,
                transactionUuid: transaction.uuid,
                transactionName: transaction.name,
                recipientActivityUuid,
                recipientName,
                recipientMaskedUin,
                recipientEmail,
                recipientDob,
                recipientContact,
                isNonSingpassRetrievable,
                agencyFileAssetUuid,
                agencyFileAssetName,
                agencyFileAssetDeleteAt,
                transactionStatus,
                failSubType: subType,
                failureReason: reason,
                notificationFailureReason: recipientActivityUuidToNotificationFailureMap?.[recipientActivityUuid!].failedReason,
              },
              excludeFailureDetails,
            );

            records.push(data);
          },
        );
      },
    );

    return records;
  }

  protected generateFormSgIssuanceCsvRecord(record: FormSgIssuanceRecordContent, excludeFailureDetails?: boolean): FormSgIssuanceRecord {
    const base: FormSgIssuanceRecord = {
      Index: record.index,
      'FormSg Response Id': record.formSgSubmissionId,
      'Application Type': record.applicationType || '',
      'Agency Reference Id': record.applicationExternalRefId || '',
      'Transaction Uuid': record.transactionUuid || '',
      'Transaction Name': record.transactionName || '',
      'Recipient Activity Uuid': record.recipientActivityUuid || '',
      'Recipient Masked Uin': record.recipientMaskedUin || '',
      'Recipient Name': record.recipientName || '',
      'Recipient Email': record.recipientEmail || '',
      'Recipient Dob': record.recipientDob || '',
      'Recipient Contact': record.recipientContact || '',
      'Is Non Singpass Retrievable': record.isNonSingpassRetrievable || false,
      'Agency File Asset Uuid': record.agencyFileAssetUuid || '',
      'Agency File Asset Name': record.agencyFileAssetName || '',
      'Agency File Asset Delete At': record.agencyFileAssetDeleteAt || '',
      'Transaction Status': record.transactionStatus,
      Error: record.failSubType || '',
    };

    if (!excludeFailureDetails) {
      base['Failure Reason'] = record.failureReason || '';
      base['Notification Failure Reason'] = record.notificationFailureReason || '';
    }

    return base;
  }
}
