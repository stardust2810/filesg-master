import { Test, TestingModule } from '@nestjs/testing';

import { mockEserviceWhitelistedUserEntityRepository } from '../__mocks__/eservice-whitelisted-user.entity.respository.mock';
import { EserviceWhitelistedUserEntityRepository } from '../eservice-whitelisted-user.entity.respository';
import { EserviceWhitelistedUserEntityService } from '../eservice-whitelisted-user.entity.service';

describe('EserviceWhitelistedUserEntityService', () => {
  let service: EserviceWhitelistedUserEntityService;

  beforeEach(async () => {
    if (!service) {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EserviceWhitelistedUserEntityService,
          { provide: EserviceWhitelistedUserEntityRepository, useValue: mockEserviceWhitelistedUserEntityRepository },
        ],
      }).compile();

      service = module.get<EserviceWhitelistedUserEntityService>(EserviceWhitelistedUserEntityService);
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
