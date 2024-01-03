import { VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockAgencyEntityService, mockAgencyModels } from '../../../entities/agency/__mocks__/agency.entity.service.mock';
import { AgencyEntityService } from '../../../entities/agency/agency.entity.service';
import { mockCorporateEntityService } from '../../../entities/user/__mocks__/corporate/corporate.entity.service.mock';
import { CorporateEntityService } from '../../../entities/user/corporate/corporate.entity.service';
import { mockCorporateUserAuthUser } from '../../auth/__mocks__/auth.service.mock';
import { CorppassUserService } from '../user..corppass.service';

describe('CorppassUserService', () => {
  let corppassUserService: CorppassUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorppassUserService,
        { provide: AgencyEntityService, useValue: mockAgencyEntityService },
        { provide: CorporateEntityService, useValue: mockCorporateEntityService },
      ],
    }).compile();

    corppassUserService = module.get<CorppassUserService>(CorppassUserService);
  });

  it('should be defined', () => {
    expect(corppassUserService).toBeDefined();
  });

  describe('getCorporateAgencyList', () => {
    it('should get corporate agency list', async () => {
      const mockAgencies = mockAgencyModels.map(({ name, code }) => ({ agencyName: name, agencyCode: code }));

      jest.spyOn(mockCorporateEntityService, 'retrieveCorporateByUen').mockResolvedValue({
        userId: mockCorporateUserAuthUser.userId,
      });
      jest.spyOn(mockAgencyEntityService, 'retrieveIssuingAgenciesWithStatusesByUserId').mockResolvedValue(mockAgencies);

      await corppassUserService.getCorporateAgencyListByAccessibleAgency(mockCorporateUserAuthUser);

      expect(mockCorporateEntityService.retrieveCorporateByUen).toBeCalledTimes(1);
      expect(mockCorporateEntityService.retrieveCorporateByUen).toBeCalledWith(mockCorporateUserAuthUser.corporateUen, { toThrow: true });
      expect(mockAgencyEntityService.retrieveIssuingAgenciesWithStatusesByUserId).toBeCalledWith(
        mockCorporateUserAuthUser.userId,
        VIEWABLE_FILE_STATUSES,
        undefined,
      );
    });
  });
});
