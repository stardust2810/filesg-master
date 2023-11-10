import { FileSGBaseException, FileSGBaseHttpException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE } from '@filesg/common';
import { HttpStatus } from '@nestjs/common';

/**
 * Please refer to https://confluence.ship.gov.sg/display/FILESLG/Custom+Error+Code+Design for more info
 */

export class UnknownAgencyFileAssetsException extends FileSGBaseException {
  constructor(
    componentErrorCode: COMPONENT_ERROR_CODE,
    transactionUuid: string,
    unknownAgencyFileAssetUuids: string[],
    internalLog?: string,
  ) {
    super(
      `[UnknownAgencyFileAssetsException] Transaction ${transactionUuid} does not have file assets ${unknownAgencyFileAssetUuids.join(
        ', ',
      )}`,
      componentErrorCode,
    );
    this.internalLog = internalLog;
  }
}

// =============================================================================
// Internal server error exception (500)
// =============================================================================
export class EventsHandlingException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string, internalLog?: string) {
    super(
      `[EventsHandlingException] Error when handling event: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class MissingReportDetailsException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, id: string, internalLog?: string) {
    super(
      `[MissingReportDetailsException] Missing report details in FormSg Transaction record of ${id}.`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class UnknownFormSgTransactionResultException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, id: string, internalLog?: string) {
    super(
      `[UnknownFormSgTransactionResultException] Failed to generate report. Transaction result (success / failure) of FormSg Transaction record ${id} is unknown.`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}

export class FailedToSaveException extends FileSGBaseHttpException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, error: string, internalLog?: string) {
    super(
      `[FailedToSaveException] Error when saving to db: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      componentErrorCode,
      EXCEPTION_ERROR_CODE.INTERNAL_SERVER_ERROR,
    );
    this.internalLog = internalLog;
  }
}
