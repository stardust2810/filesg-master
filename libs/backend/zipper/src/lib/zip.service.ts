import { LogMethod } from '@filesg/backend-common';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import archiver from 'archiver';
import { Readable } from 'stream';

import { COMPRESSION_LEVEL } from './zipper.const';
import { ZippingFile, ZipStream } from './zipper.typings';

// add typescript support for archiver-zip-encrypted
// https://github.com/artem-karpenko/archiver-zip-encrypted
declare module 'archiver' {
  interface CoreOptions {
    encryptionMethod?: 'aes256' | 'zip20';
    password?: string;
  }
}

@Injectable()
export class ZipService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ZipService.name);

  onApplicationBootstrap() {
    if (!archiver.isRegisteredFormat('zip-encrypted')) {
      archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
    }
  }

  /**
   *  Future plan: possible to have zipToDisk, zipToBuffer etc which uses zipToStream
   */

  /**
   * This is the only method to change if there is a need to change zipping library
   *
   * @param input list of filename and file streams to be zipped
   * @param finalizesZip Toggle for finalizing zip, which allows additional event listeners. zip.finalized MUST be manually called if set to false. Defaults to true
   * @returns archiver.Archiver, which is a extended version of Readable (stream)
   */
  @LogMethod()
  public async zipToStream(input: ZippingFile[], password?: string, finalizesZip = true): Promise<ZipStream> {
    const taskMessage = 'Creating zip file';
    this.logger.log(taskMessage);

    let zip: ZipStream;

    if (password) {
      zip = archiver.create('zip-encrypted', { zlib: { level: COMPRESSION_LEVEL }, encryptionMethod: 'aes256', password });
    } else {
      zip = archiver('zip', { zlib: { level: COMPRESSION_LEVEL } });
    }

    /**
     * Manual event handling as Archiver uses pipe instead of pipeline
     * https://www.alxolr.com/articles/understanding-memory-leaks-in-node-js-part-1
     */
    this.handleSourceEvents(input, zip);
    this.handleZipEvents(input, zip);

    input.forEach(({ body, name }) => {
      this.logger.log(`Adding file to zip: ${name}`);
      zip.append(body, { name });
    });

    // IMPORTANT! Attach all event listeners before finalise
    finalizesZip && zip.finalize();

    this.logger.log(`[Success] ${taskMessage}`);
    return zip;
  }

  public async zipDirToStream(dirPath: string, password?: string): Promise<ZipStream> {
    const taskMessage = 'Creating zip file';

    let zip: ZipStream;

    if (password) {
      zip = archiver.create('zip-encrypted', { zlib: { level: COMPRESSION_LEVEL }, encryptionMethod: 'aes256', password });
    } else {
      zip = archiver('zip', { zlib: { level: COMPRESSION_LEVEL } });
    }

    zip.glob('**/*', { cwd: dirPath, ignore: ['**/__MACOSX/**'] });

    // IMPORTANT! Attach all event listeners before finalise
    zip.finalize();

    this.logger.log(`[Success] ${taskMessage}`);
    return zip;
  }

  /**
   * IMPORTANT! Do not throw errors in event emitters
   * https://blog.bitsrc.io/when-try-catch-doesnt-catch-errors-in-node-js-d2f339ed9cf4
   *
   * Not destroying zip on 'end' as other files may still be streaming
   */
  private handleSourceEvents(input: ZippingFile[], zip: ZipStream) {
    input.forEach(({ body, name }) => {
      if (body instanceof Readable) {
        body.on('error', (error) => {
          this.logger.warn(`File ${name} stream error: ${error}`);

          !zip.destroyed && zip.destroy();
          !body.destroyed && body.destroy();

          this.logger.warn(`File ${name} & zip streams destroyed`);
        });
      }
    });
  }

  /**
   * IMPORTANT! Do not throw errors in event emitters
   * https://blog.bitsrc.io/when-try-catch-doesnt-catch-errors-in-node-js-d2f339ed9cf4
   */
  private handleZipEvents(input: ZippingFile[], zip: archiver.Archiver) {
    zip.on('close', () => {
      this.destroySourceStreams(input);
    });

    zip.on('warning', (error) => {
      if (error.code === 'ENOENT') {
        this.logger.warn(`Zip Warning (ENOENT): ${error}`);
      } else {
        this.logger.warn(`Zip Warning: ${error}`);
        this.destroySourceStreams(input);
        this.logger.warn(`Source streams destroyed`);
      }
    });

    zip.on('error', (error) => {
      this.logger.warn(`Zip Error: ${error}`);
      this.destroySourceStreams(input);
      this.logger.warn(`Source streams destroyed`);
    });
  }

  private destroySourceStreams(input: ZippingFile[]) {
    input.forEach(({ body }) => {
      if (body instanceof Readable && !body.destroyed) {
        body.destroy();
      }
    });
  }
}
