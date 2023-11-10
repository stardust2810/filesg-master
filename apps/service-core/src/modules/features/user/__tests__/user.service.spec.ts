import { Test, TestingModule } from '@nestjs/testing';

import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockCitizenUserEntityService } from '../../../entities/user/__mocks__/citizen-user.entity.service.mock';
import { mockUserEntityService } from '../../../entities/user/__mocks__/user.entity.service.mock';
import { CitizenUserEntityService } from '../../../entities/user/citizen-user.entity.service';
import { UserEntityService } from '../../../entities/user/user.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockUser } from '../__mocks__/user.service.mock';
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: CitizenUserEntityService, useValue: mockCitizenUserEntityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('service logic', () => {
    it('check if duplicate user exists to be true', async () => {
      const email = 'jason@gmail.com';
      mockUserEntityService.retrieveUserByEmail.mockResolvedValueOnce(mockUser);

      expect(await userService.checkDuplicateEmail(email)).toEqual({ isDuplicate: true });
      expect(mockUserEntityService.retrieveUserByEmail).toBeCalledWith(email, { toThrow: false });
    });

    it('check if duplicate user exists to be false', async () => {
      const email = 'hello@gmail.com';
      mockUserEntityService.retrieveUserByEmail.mockResolvedValueOnce(undefined);

      expect(await userService.checkDuplicateEmail(email)).toEqual({ isDuplicate: false });
      expect(mockUserEntityService.retrieveUserByEmail).toBeCalledWith(email, { toThrow: false });
    });
  });
});
