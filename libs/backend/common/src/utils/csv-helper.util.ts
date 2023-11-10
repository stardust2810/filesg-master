import { compareArrays } from '@filesg/common';
import csv from 'csv-parser';
import { createReadStream, existsSync as checkIfFileExists } from 'fs';

export const convertCsvToJson = async (
  filePath: string,
  headers: string[],
  isRequired: boolean,
  headersWithJSONStringValue: string[],
): Promise<unknown[]> => {
  const results: any[] = [];

  if (!isRequired && !checkIfFileExists(filePath)) {
    return results;
  }

  const stream = createReadStream(filePath).pipe(
    csv({
      mapValues: ({ header, value }) => {
        if (headersWithJSONStringValue.includes(header) && header !== value) {
          return JSON.parse(value);
        } else {
          return value;
        }
      },
    }),
  );

  return new Promise((resolve, reject) => {
    stream.on('data', (data: unknown) => results.push(data));
    stream.on('headers', (headersInCsv) => {
      const { isEqual, missingElements, additionalElements } = compareArrays(headers, headersInCsv);

      const missingHeadersMessage = missingElements.length > 0 ? `Missing headers: ${JSON.stringify(missingElements)}.` : '';
      const additionalHeadersMessage = additionalElements.length > 0 ? `Additional headers: ${JSON.stringify(additionalElements)}.` : '';

      if (!isEqual) {
        reject(new Error(`Headers do not match. ${missingHeadersMessage} ${additionalHeadersMessage}`));
      }
    });
    stream.on('end', () => resolve(results));
    stream.on('error', (err) => reject(err));
  });
};
