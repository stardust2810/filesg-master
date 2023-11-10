import { FileExtension, MimeType } from 'file-type';

export type AgencyPasswordFileInfo = {
  filePath: string;
  absoluteFilePath: string;
  ext: FileExtension | undefined;
  mime: MimeType | undefined;
  size: number;
};
