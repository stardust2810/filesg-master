import { DocumentEncryptionInput } from '@filesg/backend-common';
import { UnzipService, ZipService } from '@filesg/zipper';

import { MockService } from '../../../../typings/common.mock';
import { DocEncryptionService } from '../doc-encryption.service';

// =============================================================================
// Test service
// =============================================================================
export class TestDocEncryptionService extends DocEncryptionService {
  public getPassThrough() {
    return super.getPassThrough();
  }
}

// =============================================================================
// Mock data
// =============================================================================
export const mockUnzipService: MockService<UnzipService> = {
  unzipToZipStream: jest.fn(),
  unzipToDisk: jest.fn(),
};

export const mockZipService: MockService<ZipService> = {
  onApplicationBootstrap: jest.fn(),
  zipToStream: jest.fn(),
  zipDirToStream: jest.fn(),
};

export const mockTextFileData = `e1xydGYxXGFuc2lcYW5zaWNwZzEyNTJcY29jb2FydGYyNjM2Clxjb2NvYXRleHRzY2FsaW5nMFxjb2NvYXBsYXRmb3JtMHtcZm9udHRibFxmMFxmbmlsXGZjaGFyc2V0MCBIZWx2ZXRpY2FOZXVlLUJvbGQ7XGYxXGZuaWxcZmNoYXJzZXQwIEhlbHZldGljYU5ldWU7fQp7XGNvbG9ydGJsO1xyZWQyNTVcZ3JlZW4yNTVcYmx1ZTI1NTt9CntcKlxleHBhbmRlZGNvbG9ydGJsOzt9ClxwYXBlcncxMTkwMFxwYXBlcmgxNjg0MFxtYXJnbDE0NDBcbWFyZ3IxNDQwXHZpZXd3MTE1MjBcdmlld2g4NDAwXHZpZXdraW5kMApcZGVmdGFiNTYwClxwYXJkXHBhcmRlZnRhYjU2MFxwYXJ0aWdodGVuZmFjdG9yMAoKXGYwXGJcZnM0MCBcY2YwIFwKXHBhcmRccGFyZGVmdGFiNTYwXHNsbGVhZGluZzIwXHBhcnRpZ2h0ZW5mYWN0b3IwCgpcZjFcYjBcZnMyNiBcY2YwIFRoaXMgaXMgdGV4dCBmaWxlXApUaGlzIGlzIHRleHQgZmlsZX0=`;
export const mockTextFileContentType = 'text/plain';

export const mockZipFileData = `some zip file data`;

export const mockInput: DocumentEncryptionInput = {
  fileName: 'mockFileName',
  fromKey: 'mockFromUser/fileasset-1',
  toKey: 'mockToUser/fileasset-1',
  assumeRole: { receiver: 'mockToUser' },
  password: 'mockPassword',
};
