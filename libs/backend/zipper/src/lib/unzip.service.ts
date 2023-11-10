import { Injectable, Logger } from '@nestjs/common';
import archiver from 'archiver';
import extract from 'extract-zip';
import { createReadStream } from 'fs';
import { rm } from 'fs/promises';

import { ZipService } from './zip.service';
import { ZipperInputType } from './zipper.typings';
import { getFileList, getInputFilePath } from './zipper.utils';

/**
 * Chose unzipper as it accepts stream input, however, do note that it is not maintained.
 * In the case of vulnerability, will need to consider adm-zip and update unzipToDisk method
 */
@Injectable()
export class UnzipService {
  private readonly logger = new Logger(UnzipService.name);

  constructor(private readonly zipService: ZipService) {}

  /**
   * Zip files are never meant to be processed as Stream: https://github.com/thejoshwolfe/yauzl#no-streaming-unzip-api
   *
   * Have to extract to a tmp directory and zip from there
   */
  public async unzipToZipStream(input: ZipperInputType, tmpDir: string, password?: string): Promise<archiver.Archiver> {
    await this.unzipToDisk(input, tmpDir);

    // NOTE: if not excluding __MACOSX directory when compressing with password,
    // will have file type error when trying to extract the output encrypted zip file
    const fileList = (await getFileList(tmpDir, this.logger)).filter((file) => !file.includes('__MACOSX'));

    const streams = await Promise.all(
      fileList.map((file) => ({
        name: file.replace(`${tmpDir}/`, ''),
        body: createReadStream(file),
      })),
    );

    const outputStream = await this.zipService.zipToStream(streams, password);

    // Deleting the tmpDir
    outputStream.on('finish', async () => {
      await rm(tmpDir, { recursive: true, force: true });
    });

    return outputStream;
  }

  public async unzipToDisk(input: ZipperInputType, output: string): Promise<void> {
    let inputPath: string;

    try {
      inputPath = await getInputFilePath(input);
    } catch (error) {
      throw new Error(`[Failed] Extracting files from zip, error: ${error}`);
    }

    try {
      await extract(inputPath, { dir: output });
    } catch (error) {
      throw new Error(`[Failed] Extracting files from zip, error: ${error}`);
    } finally {
      if (typeof input !== 'string') {
        await rm(inputPath);
      }
    }
  }
}
