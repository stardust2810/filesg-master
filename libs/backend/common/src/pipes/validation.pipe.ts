import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { InputValidationException } from '../filters/custom-exception.filter';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.VALIDATION_PIPE, { error: 'No data submitted' });
    }
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
    });

    if (errors.length > 0) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.VALIDATION_PIPE, errors);
    }
    return object;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
