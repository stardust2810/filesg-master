import { MockService } from '../../../../typings/common.mock';
import { DeleteService } from '../move-type/delete.service';

export const mockDeleteService: MockService<DeleteService> = { handleFilesDelete: jest.fn() };
