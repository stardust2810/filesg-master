import { CsvHelper, FsHelper } from '@filesg/backend-common';
import { Test, TestingModule } from '@nestjs/testing';

import { CsvValidationException, MissingSidecarFileException } from '../../../../common/custom-exceptions';
import {
  FILE_SIDECAR_FILENAME,
  NOTIFICATIONS_SIDECAR_FILENAME,
  RECIPIENT_SIDECAR_FILENAME,
  TRANSACTION_SIDECAR_FILENAME,
} from '../../../../const';
import {
  mockDir,
  mockSidecareNotificationsRecords,
  mockSidecarFileRecords,
  mockSidecarRecipientRecords,
  mockSidecarTransactionRecord,
} from '../__mocks__/sidecar-file.service.mock';
import { SidecarFileService } from '../sidecar-file.service';

describe('SidecarFileService', () => {
  let service: SidecarFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SidecarFileService],
    }).compile();

    service = module.get<SidecarFileService>(SidecarFileService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkSidecarFilesExistsOrThrow', () => {
    it('should not throw exception when there is no missing files', async () => {
      jest.spyOn(FsHelper, 'checkForMissingFilesInDir').mockResolvedValueOnce([]);

      await expect(service.checkSidecarFilesExistsOrThrow(mockDir)).resolves.not.toThrow();
      expect(FsHelper.checkForMissingFilesInDir).toBeCalledWith(mockDir, [
        TRANSACTION_SIDECAR_FILENAME,
        RECIPIENT_SIDECAR_FILENAME,
        FILE_SIDECAR_FILENAME,
        NOTIFICATIONS_SIDECAR_FILENAME,
      ]);
    });

    it('MissingSidecarFileException should be thrown when there are missing sidecar files', async () => {
      jest.spyOn(FsHelper, 'checkForMissingFilesInDir').mockResolvedValueOnce([TRANSACTION_SIDECAR_FILENAME]);

      await expect(service.checkSidecarFilesExistsOrThrow(mockDir)).rejects.toThrowError(MissingSidecarFileException);
    });
  });

  describe('parseSidecarFiles', () => {
    it('should not throw exception when there is no validation error', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce(mockSidecarRecipientRecords)
        .mockResolvedValueOnce(mockSidecarFileRecords)
        .mockResolvedValueOnce(mockSidecareNotificationsRecords);

      await expect(service.parseSidecarFiles(mockDir)).resolves.not.toThrow();
    });

    it('CsvValidationException should be thrown when there are more than 1 transaction record', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce([...mockSidecarTransactionRecord, ...mockSidecarTransactionRecord])
        .mockResolvedValueOnce(mockSidecarRecipientRecords)
        .mockResolvedValueOnce(mockSidecarFileRecords)
        .mockResolvedValueOnce(mockSidecareNotificationsRecords);

      await expect(service.parseSidecarFiles(mockDir)).rejects.toThrow(CsvValidationException);
    });

    it('CsvValidationException should be thrown when mandatory fields are missing', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}]);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when date fields are of wrong format', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce([{ ...mockSidecarRecipientRecords[0], dob: '01-01-1999' }])
        .mockResolvedValueOnce([{ ...mockSidecarFileRecords[0], expiry: '01-01-2999', deleteAt: '12-12-2999' }])
        .mockResolvedValueOnce(mockSidecareNotificationsRecords);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when dob is missing but contact was provided', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce([{ ...mockSidecarRecipientRecords[0], dob: undefined }])
        .mockResolvedValueOnce([{ ...mockSidecarFileRecords[0] }])
        .mockResolvedValueOnce(mockSidecareNotificationsRecords);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when contact is missing but dob was provided', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce([{ ...mockSidecarRecipientRecords[0], contact: undefined }])
        .mockResolvedValueOnce([{ ...mockSidecarFileRecords[0] }])
        .mockResolvedValueOnce(mockSidecareNotificationsRecords);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when date fields does not fulfil requirements', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce([{ ...mockSidecarRecipientRecords[0], dob: '2999-01-01' }]) // future date
        .mockResolvedValueOnce([{ ...mockSidecarFileRecords[0], expiry: '1990-01-01', deleteAt: '1990-12-12' }]) // past date
        .mockResolvedValueOnce(mockSidecareNotificationsRecords);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when expiry date is later than delete date', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce(mockSidecarRecipientRecords)
        .mockResolvedValueOnce([{ ...mockSidecarFileRecords[0], expiry: '2050-12-12', deleteAt: '2050-12-11' }]) // past date
        .mockResolvedValueOnce(mockSidecareNotificationsRecords);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when there is no notification channels', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce(mockSidecarRecipientRecords)
        .mockResolvedValueOnce(mockSidecarFileRecords) // past date
        .mockResolvedValueOnce([]);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when unknown notification channels is provided', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce(mockSidecarRecipientRecords)
        .mockResolvedValueOnce(mockSidecarFileRecords) // past date
        .mockResolvedValueOnce([{ ...mockSidecareNotificationsRecords[0], channel: 'UKNOWN' }]);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });

    it('CsvValidationException should be thrown when duplicate notification channels is provided', async () => {
      jest
        .spyOn(CsvHelper, 'convertCsvToJson')
        .mockResolvedValueOnce(mockSidecarTransactionRecord)
        .mockResolvedValueOnce(mockSidecarRecipientRecords)
        .mockResolvedValueOnce(mockSidecarFileRecords) // past date
        .mockResolvedValueOnce([mockSidecareNotificationsRecords[0], mockSidecareNotificationsRecords[0]]);

      try {
        await service.parseSidecarFiles(mockDir);
      } catch (error) {
        expect(error).toBeInstanceOf(CsvValidationException);

        expect((error as CsvValidationException).errorData).toMatchSnapshot();
      }

      expect.assertions(2);
    });
  });

  it('CsvValidationException should be thrown when file path is empty inside agency password sidecar file', async () => {
    jest
      .spyOn(CsvHelper, 'convertCsvToJson')
      .mockResolvedValueOnce(mockSidecarTransactionRecord)
      .mockResolvedValueOnce(mockSidecarRecipientRecords)
      .mockResolvedValueOnce(mockSidecarFileRecords)
      .mockResolvedValueOnce(mockSidecareNotificationsRecords)
      .mockResolvedValueOnce([{ filePath: '', password: 'P@ssw0rd' }]);

    try {
      await service.parseSidecarFiles(mockDir);
    } catch (error) {
      expect(error).toBeInstanceOf(CsvValidationException);

      expect((error as CsvValidationException).errorData).toMatchSnapshot();
    }

    expect.assertions(2);
  });

  it('CsvValidationException should be thrown when password is empty inside agency password sidecar file', async () => {
    jest
      .spyOn(CsvHelper, 'convertCsvToJson')
      .mockResolvedValueOnce(mockSidecarTransactionRecord)
      .mockResolvedValueOnce(mockSidecarRecipientRecords)
      .mockResolvedValueOnce(mockSidecarFileRecords)
      .mockResolvedValueOnce(mockSidecareNotificationsRecords)
      .mockResolvedValueOnce([{ filePath: 'IssuanceFile.zip/folder1/file.pdf', password: '' }]);

    try {
      await service.parseSidecarFiles(mockDir);
    } catch (error) {
      expect(error).toBeInstanceOf(CsvValidationException);

      expect((error as CsvValidationException).errorData).toMatchSnapshot();
    }

    expect.assertions(2);
  });
});
