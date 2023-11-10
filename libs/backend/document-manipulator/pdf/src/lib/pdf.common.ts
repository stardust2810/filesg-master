import { FileSGBaseException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';

export class PdfEncryptionException extends FileSGBaseException {
  constructor(error: any, inputPath: string) {
    const errorMessage = `Failed to encrypt pdf at ${inputPath}`;

    super(`[PdfEncryptionException] Error: ${errorMessage}`, COMPONENT_ERROR_CODE.PDF_SERVICE, { errorMessage });

    let internalLog = JSON.stringify(error);

    // masked password for the encrypt method
    if (typeof error === 'object' && 'cmd' in error) {
      const parseError = JSON.parse(JSON.stringify(error));

      const cmds = parseError.cmd.split(' ');
      const indexOfUserPasswordOpts = cmds.indexOf('-U');
      const indexOfOwnerPasswordOpts = cmds.indexOf('-O');

      if (indexOfUserPasswordOpts > 0) {
        cmds[indexOfUserPasswordOpts + 1] = '<REDACTED-VALUE>';
      }

      if (indexOfOwnerPasswordOpts > 0) {
        cmds[indexOfOwnerPasswordOpts + 1] = '<REDACTED-VALUE>';
      }

      const maskedCmd = cmds.join(' ');
      const errorMessage = error.message.replace(parseError.cmd, maskedCmd);
      internalLog = errorMessage;
    }

    this.internalLog = internalLog;
  }
}
