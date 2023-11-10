import { Logger } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { v4 as uuid } from 'uuid';

import { ZipperInputType } from './zipper.typings';

/**
 * Based on different input type (path string, buffer or stream), save them locally and return the saved file path
 */
export const getInputFilePath = async (input: ZipperInputType): Promise<string> => {
  if (typeof input === 'string') {
    return input;
  }

  const filePath = path.join('/tmp', `${uuid()}.zip`);

  if (Buffer.isBuffer(input)) {
    await writeFile(filePath, input);
  } else {
    const writeStream = createWriteStream(filePath);
    await pipeline(input, writeStream);
  }

  return filePath;
};

/**
 * This function will return the path with respect to the passed in dirName
 *
 */
export const getFileList = async (dirName: string, logger: Logger) => {
  let files: string[] = [];
  const items = await readdir(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...(await getFileList(`${dirName}/${item.name}`, logger))];
    } else {
      files.push(`${dirName}/${item.name}`);
    }
  }

  return files;
};
