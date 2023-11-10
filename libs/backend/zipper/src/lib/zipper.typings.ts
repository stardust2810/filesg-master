import archiver from 'archiver';
import { Readable } from 'stream';
export interface ZippingFile {
  name: string;
  body: ZipperInputType;
}

export type ZipperInputType = string | Readable | Buffer;

export type ZipStream = archiver.Archiver;
