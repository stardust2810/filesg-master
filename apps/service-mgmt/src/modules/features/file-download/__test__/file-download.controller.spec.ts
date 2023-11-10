import { Test, TestingModule } from '@nestjs/testing';

import { FileDownloadController } from '../file-download.controller';
import { FileDownloadService } from '../file-download.service';

describe.skip('FileDownloadController', () => {
  let controller: FileDownloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileDownloadController],
      providers: [FileDownloadService],
    }).compile();

    controller = module.get<FileDownloadController>(FileDownloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
