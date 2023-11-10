import { plainToClass, Transform } from 'class-transformer';

import {
  formSgBatchIssuanceFileNamesTransformer,
  formSgDateTransformer,
  formSgTextAreaTransformer,
  formSgYesNoBooleanTransformer,
} from '../transformers';

describe('transformers', () => {
  describe('formSgDateTransformer', () => {
    class DateTest {
      @Transform(formSgDateTransformer)
      date: Date;
    }
    it('should transform the date to dd-MM-yyyy format', () => {
      const firstDate = plainToClass(DateTest, { date: '01 Jan 1995' });
      expect(firstDate.date).toEqual('1995-01-01');

      const secondDate = plainToClass(DateTest, { date: '16 Nov 1995' });
      expect(secondDate.date).toEqual('1995-11-16');

      const thirdDate = plainToClass(DateTest, { date: '31 Dec 1995' });
      expect(thirdDate.date).toEqual('1995-12-31');
    });
  });

  describe('formSgYesNoBooleanTransformer', () => {
    class YesNoTransformerTest {
      @Transform(formSgYesNoBooleanTransformer)
      testBoolean?: boolean;
    }
    it('should transform yes no field to boolean', () => {
      const truthyBoolean = plainToClass(YesNoTransformerTest, { testBoolean: 'Yes' });
      expect(truthyBoolean.testBoolean).toBeTruthy();

      const falseyBoolean = plainToClass(YesNoTransformerTest, { testBoolean: 'No' });
      expect(falseyBoolean.testBoolean).toBeFalsy();

      const truthyBoolean2 = plainToClass(YesNoTransformerTest, { testBoolean: 'yes' });
      expect(truthyBoolean2.testBoolean).toBeTruthy();
    });

    it('should transform yes no field to boolean', () => {
      const randomBoolean = plainToClass(YesNoTransformerTest, { testBoolean: 'random' });
      expect(randomBoolean.testBoolean).toEqual('random');

      const emptyBoolean = plainToClass(YesNoTransformerTest, { testBoolean: '' });
      expect(emptyBoolean.testBoolean).toBeUndefined();
    });
  });

  describe('formSgTextAreaTransformer', () => {
    class YesNoTransformerTest {
      @Transform(formSgTextAreaTransformer)
      longText?: string[];
    }
    it('should transform empty string to undefined', () => {
      const emptyString = plainToClass(YesNoTransformerTest, { longText: '' });
      expect(emptyString.longText).toBeUndefined();
    });
  });

  describe('formSgBatchIssuanceFileNamesTransformer', () => {
    class BatchIssuanceFileNamesTransformerTest {
      @Transform(formSgBatchIssuanceFileNamesTransformer)
      fileNames?: string[];
    }

    it('should transform any non-string and empty string to undefined', () => {
      const emptyString = plainToClass(BatchIssuanceFileNamesTransformerTest, { fileNames: '' });
      const number = plainToClass(BatchIssuanceFileNamesTransformerTest, { fileNames: 1 });
      const truth = plainToClass(BatchIssuanceFileNamesTransformerTest, { fileNames: true });
      const array = plainToClass(BatchIssuanceFileNamesTransformerTest, { fileNames: ['hello world'] });
      const object = plainToClass(BatchIssuanceFileNamesTransformerTest, { fileNames: { key: 'value' } });

      expect(emptyString.fileNames).toBeUndefined;
      expect(number.fileNames).toBeUndefined;
      expect(truth.fileNames).toBeUndefined;
      expect(array.fileNames).toBeUndefined;
      expect(object.fileNames).toBeUndefined;
    });

    it('should trim any whitespaces from start and end of fileNames', () => {
      const fileNamesWithSpaces = plainToClass(BatchIssuanceFileNamesTransformerTest, { fileNames: 'file1.png ; file2.pdf;file3.pdf ' });

      expect(fileNamesWithSpaces.fileNames).toEqual(['file1.png', 'file2.pdf', 'file3.pdf']);
    });

    it('should handle stray semicolons', () => {
      const fileNamesWithSpaces = plainToClass(BatchIssuanceFileNamesTransformerTest, { fileNames: ';file1.png ;; file2.pdf;file3.pdf; ' });

      expect(fileNamesWithSpaces.fileNames).toEqual(['file1.png', 'file2.pdf', 'file3.pdf']);
    });
  });
});
