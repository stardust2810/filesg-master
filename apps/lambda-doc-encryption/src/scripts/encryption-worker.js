const { fromFileAsync } = require('xlsx-populate');
const { exec } = require('child_process');

// =============================================================================
// Exceptions
// =============================================================================
class ExcelEncryptionException extends Error {
  constructor(error, inputPath) {
    const errorMessage = `Failed to encrypt excel (xlsx) at ${inputPath}. Error: ${error.message}`;
    super(`[ExcelEncryptionException] ${errorMessage}`);
  }
}

class PdfEncryptionException extends Error {
  constructor(error, inputPath) {
    let errorLog = JSON.stringify(error);

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
      errorLog = errorMessage;
    }

    const errorMessage = `Failed to encrypt pdf at ${inputPath}. Error: ${errorLog}`;
    super(`[PdfEncryptionException] ${errorMessage}`);
  }
}

// =============================================================================
// Utils
// =============================================================================
const execShellCmd = async (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error ?? stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const escapeString = (str) => str.replace(/ /g, '\\ ');

// =============================================================================
// Functions
// =============================================================================
const encryptExcel = async ({ inputPath, outputPath, password }) => {
  try {
    const startTime = new Date().getTime();
    const workbook = await fromFileAsync(inputPath);
    await workbook.toFileAsync(outputPath, { password });
    return `[Succeed] Encrypting excel (xlsx) file from ${inputPath} to ${outputPath}. Time taken: ${new Date().getTime() - startTime} ms.`;
  } catch (error) {
    throw new ExcelEncryptionException(error, inputPath);
  }
};

const encryptPdf = async ({ inputPath, outputPath, password, pdfBoxJarFilePath }) => {
  try {
    const startTime = new Date().getTime();
    await execShellCmd(`java -jar ${pdfBoxJarFilePath} Encrypt -U "${password}" ${escapeString(inputPath)} ${escapeString(outputPath)}`);
    return `[Succeed] Encrypting pdf file from ${inputPath} to ${outputPath}. Time taken: ${new Date().getTime() - startTime} ms.`;
  } catch (error) {
    throw new PdfEncryptionException(error, inputPath);
  }
};

// =============================================================================
// Exports
// =============================================================================
module.exports = {
  encryptExcel,
  encryptPdf,
};
