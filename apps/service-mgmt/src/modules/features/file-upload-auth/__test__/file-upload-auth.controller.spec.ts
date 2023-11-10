import { Test, TestingModule } from '@nestjs/testing';

import { FileUploadAuthController } from '../file-upload-auth.controller';
import { FileUploadAuthService } from '../file-upload-auth.service';

describe.skip('FileUploadAuthController', () => {
  let controller: FileUploadAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadAuthController],
      providers: [FileUploadAuthService],
    }).compile();

    controller = module.get<FileUploadAuthController>(FileUploadAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
