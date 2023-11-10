import { Test, TestingModule } from '@nestjs/testing';

import { mockDeletionService } from '../__mocks__/deletion.service.mock';
import { DeletionController } from '../deletion.controller';
import { DeletionService } from '../deletion.service';

describe('DeletionController', () => {
  let controller: DeletionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeletionController],
      providers: [{ provide: DeletionService, useValue: mockDeletionService }],
    }).compile();

    controller = module.get<DeletionController>(DeletionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
