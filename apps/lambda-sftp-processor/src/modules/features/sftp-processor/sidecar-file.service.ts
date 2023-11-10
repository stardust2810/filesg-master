import { checkForMissingFilesInDir, convertCsvToJson } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { CsvValidationException, MissingSidecarFileException, ParsingCsvException } from '../../../common/custom-exceptions';
import { SidecarData } from '../../../common/dtos/sidecar-data';
import { SIDECAR_FILES_INFO } from '../../../const';

@Injectable()
export class SidecarFileService {
  private readonly logger = new Logger(SidecarFileService.name);

  public checkSidecarFilesExistsOrThrow = async (extractedZipDir: string) => {
    const missingFiles: string[] = await checkForMissingFilesInDir(
      extractedZipDir,
      SIDECAR_FILES_INFO.filter((sidecar) => sidecar.required).map((sidecar) => sidecar.name),
    );

    if (missingFiles.length > 0) {
      throw new MissingSidecarFileException(COMPONENT_ERROR_CODE.SIDECAR_FILE_SERVICE, missingFiles);
    }
  };

  public async parseSidecarFiles(sidecarFileDir: string): Promise<SidecarData> {
    const parsingResult = await Promise.allSettled(
      SIDECAR_FILES_INFO.map(({ name, headers, required, headersWithJSONStringValue }) =>
        convertCsvToJson(`${sidecarFileDir}/${name}`, headers, required, headersWithJSONStringValue),
      ),
    );

    const parsingErrorResults = parsingResult.reduce((acc, result, index) => {
      if (result.status === 'rejected') {
        acc.push({
          filename: SIDECAR_FILES_INFO[index].name,
          msg: result.reason.message,
        });
      }

      return acc;
    }, [] as ConstructorParameters<typeof ParsingCsvException>[1]);

    if (parsingErrorResults.length > 0) {
      throw new ParsingCsvException(COMPONENT_ERROR_CODE.SIDECAR_FILE_SERVICE, parsingErrorResults);
    }

    // At this point, parsingResult is 100% PromiseFulfiledResult as validation is done
    return this.transformAndValidateSidecarData(parsingResult as PromiseFulfilledResult<unknown>[]);
  }

  protected transformAndValidateSidecarData = (parseCsvResults: PromiseFulfilledResult<unknown>[]): SidecarData => {
    const serializedSidecarData = SIDECAR_FILES_INFO.reduce((acc, { key }, index) => {
      acc[key] = parseCsvResults[index].value;
      return acc;
    }, {} as Record<keyof SidecarData, unknown>);

    const sidecarData = plainToClass(SidecarData, serializedSidecarData);

    const validationErrors = validateSync(sidecarData, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
    });

    if (validationErrors.length > 0) {
      throw new CsvValidationException(COMPONENT_ERROR_CODE.SIDECAR_FILE_SERVICE, validationErrors);
    }

    return sidecarData;
  };
}
