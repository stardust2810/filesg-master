import { existsSync, promises as fs, rmSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';

// =============================================================================
// File Operations
// =============================================================================
export const isFileExists = (path: string): boolean => {
  return existsSync(path);
};

export const rmFile = async (path: string): Promise<void> => {
  // The path is derived from the upstream function and is NEVER a user input
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.unlink(path);
};

export const moveFile = async (srcPath: string, destPath: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.rename(srcPath, destPath);
};

export const writeToFile = async (path: string, dataToWrite: string | Buffer) => {
  await writeFile(path, dataToWrite);
};

export const getAbsoluteFilePath = (dirPath: string, relativeFilePath: string): string => path.join(dirPath, relativeFilePath);

// =============================================================================
// Dir Operations
// =============================================================================
export const listDirContent = async (dirPath: string): Promise<string[]> => {
  // The path is derived from the upstream function and is NEVER a user input
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return await fs.readdir(dirPath);
};

export const listAllDirAndSubDirContent = async (dirPath: string): Promise<string[]> => {
  const files = await listDirContent(dirPath);
  const contents: string[] = [];

  for (const file of files) {
    const absolute = getAbsoluteFilePath(dirPath, file);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if ((await fs.stat(absolute)).isDirectory()) {
      contents.push(...(await listAllDirAndSubDirContent(absolute)));
    } else {
      contents.push(absolute);
    }
  }

  return contents;
};

export const createDir = async (path: string): Promise<void> => {
  if (!existsSync(path)) {
    // The path is derived from the upstream function and is NEVER a user input
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(path, { recursive: true });
  }
};

export const rmDir = async (dir: string): Promise<void> => {
  // fs.rm() (async) does not delete nested non empty dir
  rmSync(dir, { recursive: true, force: true });
};

export const checkForMissingFilesInDir = async (dirPath: string, requiredFiles: string[]): Promise<string[]> => {
  const filesInDir = await listDirContent(dirPath);
  return requiredFiles.filter((file) => !filesInDir.includes(file));
};

export const checkForMissingFilesInDirAndSubDir = async (dirPath: string, requiredRelativeFilePaths: string[]): Promise<string[]> => {
  const filesInDir = await listAllDirAndSubDirContent(dirPath);
  return requiredRelativeFilePaths.filter((filePath) => !filesInDir.includes(getAbsoluteFilePath(dirPath, filePath)));
};
