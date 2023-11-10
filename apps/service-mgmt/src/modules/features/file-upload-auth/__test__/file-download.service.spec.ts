import { Test, TestingModule } from '@nestjs/testing';

import { FileUploadAuthService } from '../file-upload-auth.service';

describe.skip('FileUploadAuthService', () => {
  let service: FileUploadAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadAuthService],
    }).compile();

    service = module.get<FileUploadAuthService>(FileUploadAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
