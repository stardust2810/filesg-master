import { FileSGBaseException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';

import { AgencyPasswordFileInfo } from '../typings/common';

export class FileDownloadException extends FileSGBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE, key: string) {
    super(`[FileDownloadException] Error when downloading file with key ${key}: ${message}`, componentErrorCode);
  }
}

export class UnsupportedFileTypeException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, contentType: string) {
    super(`[UnsupportedFileTypeException] File type of ${contentType} is not supported`, componentErrorCode);
  }
}

export class GetFileSizeException extends FileSGBaseException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE, key: string) {
    super(`[GetFileSizeException] Error when getting size of object with key ${key}: ${message}`, componentErrorCode);
  }
}

export class UnsupportedFileTypeForEncryptionException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, mainFilename: string, fileinfo: AgencyPasswordFileInfo[]) {
    super(
      `[UnsupportedFileTypeForEncryptionException] File type is not supported for password protection. ${JSON.stringify({
        [mainFilename]: fileinfo.map(({ filePath, mime }) => ({ filePath, mime })),
      })}`,
      componentErrorCode,
    );
  }
}

export class MissingFileException extends FileSGBaseException {
  constructor(componentErrorCode: COMPONENT_ERROR_CODE, mainFilename: string, missingFiles: string[]) {
    super(`[MissingFileException] Missing files: ${JSON.stringify({ [mainFilename]: missingFiles })}`, componentErrorCode);
  }
}
