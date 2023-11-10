import { UnzipService, ZipService } from '@filesg/zipper';
import { Test, TestingModule } from '@nestjs/testing';

import { getTargetUnzipDirectory } from '../../../../const';
import { mockS3Service } from '../../aws/__mocks__/s3.service.mock';
import { mockStsService } from '../../aws/__mocks__/sts.service.mock';
import { S3Service } from '../../aws/s3.service';
import { StsService } from '../../aws/sts.service';
import { mockUnzipService, mockZipService, TestDocEncryptionService } from '../__mocks__/doc-encryption.service.mock';

// FIXME: fix the unit test
describe.skip('DocEncryptionService', () => {
  let service: TestDocEncryptionService;
  const targetUnzipDirectory = getTargetUnzipDirectory();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestDocEncryptionService,
        { provide: UnzipService, useValue: mockUnzipService },
        { provide: ZipService, useValue: mockZipService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: StsService, useValue: mockStsService },
      ],
    }).compile();

    service = module.get<TestDocEncryptionService>(TestDocEncryptionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('processEvent', () => {
  //   beforeAll(() => {
  //     archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));
  //   });

  //   it('should throw UnsupportedFileTypeException when the content type of the downloaded file is not allowed in FileSG', async () => {
  //     mockS3Service.downloadFileFromStgCleanBucket.mockResolvedValueOnce({ Body: mockTextFileData, ContentType: mockTextFileContentType });

  //     const errorMessage = new UnsupportedFileTypeException(COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE, mockTextFileContentType).message;

  //     expect(await service.processEvent(mockInput)).toEqual({ errorMessage });
  //   });

  //   it('should unzip and zip again with password encryption if the file type is of zip', async () => {
  //     const { fromKey, toKey, password, assumeRole } = mockInput;
  //     const mockFileSize = 88;

  //     const outputZipStream = archiver.create('zip-encrypted', {
  //       zlib: { level: COMPRESSION_LEVEL },
  //       encryptionMethod: 'aes256',
  //       password,
  //     });
  //     await outputZipStream.finalize();

  //     mockS3Service.downloadFileFromStgCleanBucket.mockResolvedValueOnce({ Body: mockZipFileData, ContentType: MIME_TYPE.ZIP });
  //     mockUnzipService.unzipToZipStream.mockResolvedValueOnce(outputZipStream);
  //     mockS3Service.getFileSizeFromMainBucket.mockResolvedValueOnce(mockFileSize);

  //     const mockPassThrough = new PassThrough();
  //     jest.spyOn(service, 'getPassThrough').mockReturnValueOnce(mockPassThrough);

  //     expect(await service.processEvent(mockInput)).toEqual({ fromKey, toKey, size: mockFileSize });

  //     expect(mockUnzipService.unzipToZipStream).toBeCalledWith(mockZipFileData, UNZIP_DIR, password);
  //     expect(mockS3Service.uploadZipToMainBucket).toBeCalledWith(
  //       {
  //         Key: toKey,
  //         Body: outputZipStream.pipe(mockPassThrough),
  //         ContentType: MIME_TYPE.ZIP,
  //       },
  //       assumeRole,
  //     );
  //     expect(mockS3Service.getFileSizeFromMainBucket).toBeCalledWith(toKey, assumeRole);
  //   });

  //   it('should zip the file with password encryption if the file type is not a zip', async () => {
  //     const { fileName, fromKey, toKey, password, assumeRole } = mockInput;
  //     const mockFileSize = 88;

  //     const outputZipStream = archiver.create('zip-encrypted', {
  //       zlib: { level: COMPRESSION_LEVEL },
  //       encryptionMethod: 'aes256',
  //       password,
  //     });
  //     await outputZipStream.finalize();

  //     mockS3Service.downloadFileFromStgCleanBucket.mockResolvedValueOnce({ Body: mockZipFileData, ContentType: MIME_TYPE.PDF });
  //     mockZipService.zipToStream.mockResolvedValueOnce(outputZipStream);
  //     mockS3Service.getFileSizeFromMainBucket.mockResolvedValueOnce(mockFileSize);

  //     const mockPassThrough = new PassThrough();
  //     jest.spyOn(service, 'getPassThrough').mockReturnValueOnce(mockPassThrough);

  //     expect(await service.processEvent(mockInput)).toEqual({ fromKey, toKey, size: mockFileSize });

  //     expect(mockZipService.zipToStream).toBeCalledWith([{ name: fileName, body: mockZipFileData as unknown as Readable }], password);
  //     expect(mockS3Service.uploadZipToMainBucket).toBeCalledWith(
  //       {
  //         Key: toKey,
  //         Body: outputZipStream.pipe(mockPassThrough),
  //         ContentType: MIME_TYPE.ZIP,
  //       },
  //       assumeRole,
  //     );
  //     expect(mockS3Service.getFileSizeFromMainBucket).toBeCalledWith(toKey, assumeRole);
  //   });

  //   it('should return errorMessage when there is any error', async () => {
  //     const { fromKey } = mockInput;
  //     const error = new FileDownloadException('some error message', COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE, fromKey);

  //     mockS3Service.downloadFileFromStgCleanBucket.mockRejectedValueOnce(error);

  //     expect(await service.processEvent(mockInput)).toEqual({ errorMessage: error.message });
  //   });

  //   it('should return errorMessage and isHeadObjectError equals to true when there is any error ans error is of type GetFileSizeException', async () => {
  //     const { toKey } = mockInput;
  //     const error = new GetFileSizeException('some error message', COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE, toKey);

  //     mockS3Service.downloadFileFromStgCleanBucket.mockRejectedValueOnce(error);

  //     expect(await service.processEvent(mockInput)).toEqual({ errorMessage: error.message, isHeadObjectError: true });
  //   });
  // });
});
