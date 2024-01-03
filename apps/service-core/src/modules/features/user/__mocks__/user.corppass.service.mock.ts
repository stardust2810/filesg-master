import { MockService } from '../../../../typings/common.mock';
import { CorppassUserService } from '../user..corppass.service';

export const mockCorppassUserService: MockService<CorppassUserService> = {
  getCorporateAgencyListByAccessibleAgency: jest.fn(),
};
