import { createDir, execShellCmd, isFileExists, LogMethod, moveFile, writeToFile } from '@filesg/backend-common';
import { Injectable, Logger } from '@nestjs/common';

import {
  SliftCertGenerationException,
  SliftDecryptException,
  SliftFileTypeException,
  SliftMissingException,
} from '../../../common/custom-exceptions';
import { SLIFT_ENCRYPTED_FILE_EXT, SLIFT_RECEIVER_PFX_BASE64, SLIFT_RECEIVER_PFX_PASSWORD } from '../../../const';
import { FileSGConfigService } from '../../setups/config/config.service';
import { SmService } from '../aws/sm.service';

@Injectable()
export class SliftService {
  private logger = new Logger(SliftService.name);
  private certDir: string;
  private privateCertPath: string;
  private privateCertBase64: string;
  private privateCertPassword: string;

  constructor(private readonly smService: SmService, private readonly fileSGConfigService: FileSGConfigService) {}

  @LogMethod()
  public async init(workingDir: string) {
    this.certDir = `${workingDir}/certs`;
    this.privateCertPath = `${this.certDir}/receiver.pfx`;
    await createDir(this.certDir);
    await this.generatePrivateKeyAndSaveToDisk();
    this.verifySliftScriptPresent();
  }

  @LogMethod()
  public async decrypt(srcPath: string, destPath: string): Promise<void> {
    if (!this.privateCertPassword) {
      this.logger.log(`Getting certifcate private key password from secrets manager.`);
      this.privateCertPassword = await this.smService.getSecretValue(SLIFT_RECEIVER_PFX_PASSWORD);
    }

    const { sliftDir } = this.fileSGConfigService.sliftConfig;

    this.logger.log(`Checking if the file extension is of type ${SLIFT_ENCRYPTED_FILE_EXT} before decryption`);
    if (srcPath.slice(-SLIFT_ENCRYPTED_FILE_EXT.length) !== SLIFT_ENCRYPTED_FILE_EXT) {
      throw new SliftFileTypeException();
    }

    const decryptedFilePath = srcPath.slice(0, -SLIFT_ENCRYPTED_FILE_EXT.length);

    try {
      this.logger.log(`Decrypting file ${decryptedFilePath}`);
      await execShellCmd(`cd ${sliftDir} && ./run.sh -d -pfx ${this.privateCertPath} ${this.privateCertPassword} ${srcPath}`);
    } catch (err) {
      throw new SliftDecryptException(srcPath, err as Error);
    }

    this.logger.log(`Copying decrypted file from ${decryptedFilePath} to ${destPath}`);
    await moveFile(decryptedFilePath, destPath);
  }

  // =============================================================================
  // Private functions
  // =============================================================================
  private async generatePrivateKeyAndSaveToDisk() {
    if (!this.privateCertBase64) {
      this.logger.log(`Getting certifcate private key from secrets manager.`);
      this.privateCertBase64 = await this.smService.getSecretValue(SLIFT_RECEIVER_PFX_BASE64);
    }

    try {
      this.logger.log(`Trying to generate the receiver pfx file from base64`);

      const binary = Buffer.from(this.privateCertBase64, 'base64');
      await writeToFile(this.privateCertPath, binary);

      this.logger.log(`Successfully created cretificate file with extension .pfx at location ${this.privateCertPath}`);
    } catch (err) {
      throw new SliftCertGenerationException(err as Error);
    }
  }

  private verifySliftScriptPresent() {
    const { sliftDir } = this.fileSGConfigService.sliftConfig;
    const sliftScriptLocation = `${sliftDir}/run.sh`;
    if (!isFileExists(sliftScriptLocation)) {
      throw new SliftMissingException(sliftDir);
    }
    this.logger.log(`Found slift script at location ${sliftScriptLocation}`);
  }
}
