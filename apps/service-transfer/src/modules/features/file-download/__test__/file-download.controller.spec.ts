import { S3Service } from '@filesg/aws';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { MGMT_SERVICE_API_CLIENT_PROVIDER } from '../../../../typings/common';
import { StsService } from '../../aws/sts.service';
import { FileDownloadController } from '../file-download.controller';
import { FileDownloadService } from '../file-download.service';

describe('FileDownloadController', () => {
  let controller: FileDownloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileDownloadController],
      providers: [
        {
          provide: FileDownloadService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: S3Service,
          useValue: {},
        },
        {
          provide: StsService,
          useValue: {},
        },
        {
          provide: MGMT_SERVICE_API_CLIENT_PROVIDER,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<FileDownloadController>(FileDownloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('download', () => {
    it('should be defined', () => {
      expect(controller.download).toBeDefined();
    });
  });
});
