/* eslint-disable sonarjs/no-duplicate-string */
import { Test, TestingModule } from '@nestjs/testing';

import { FormSgIdMismatchError } from '../common/custom-exceptions';
import { FormSgService } from '../formsg.service';

describe('FormSgService', () => {
  let service: FormSgService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormSgService],
    }).compile();

    service = module.get<FormSgService>(FormSgService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('decryptFormDataWithAttachments', () => {
    it('should be defined', () => {
      expect(service.decryptFormDataWithAttachments).toBeDefined();
    });
  });

  describe('decryptFormData', () => {
    it('should be defined', () => {
      expect(service.decryptFormData).toBeDefined();
    });
  });

  describe('validateFormId', () => {
    it('should be defined', () => {
      expect(service.validateFormId).toBeDefined();
    });

    it('should not throw FormSgIdMismatchError if formIds match', () => {
      expect(() => service.validateFormId('id1', 'id1')).not.toThrow(FormSgIdMismatchError);
    });

    it('should throw FormSgIdMismatchError if formIds do not match', () => {
      // need to wrap in another function for toThrow to catch
      // https://jestjs.io/docs/expect#tothrowerror:~:text=You%20must%20wrap%20the%20code%20in%20a%20function%2C%20otherwise%20the%20error%20will%20not%20be%20caught%20and%20the%20assertion%20will%20fail.
      expect(() => service.validateFormId('id1', 'id2')).toThrow(FormSgIdMismatchError);
    });
  });

  describe('authenticateWebhook', () => {
    it('should be defined', () => {
      expect(service.authenticateWebhook).toBeDefined();
    });
  });
});
