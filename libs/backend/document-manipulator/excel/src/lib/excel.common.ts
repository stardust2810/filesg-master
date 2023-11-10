import { FileSGBaseException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';

export class XlsxLoadFileException extends FileSGBaseException {
  constructor(inputPath: string) {
    const errorMessage = `Failed to read the xlsx file from the input path ${inputPath}. Make sure there is valid xlsx file at the input path.`;
    super(`[XlsxLoadFileException] Error: ${errorMessage}`, COMPONENT_ERROR_CODE.EXCEL_SERVICE, { errorMessage });
  }
}
