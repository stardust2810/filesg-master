import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';

export class AWSException extends InternalServerErrorException {
  constructor(err: string) {
    super(`[AWSException] Error from AWS: ${err}`);
  }
}

export class InputValidationException extends HttpException {
  constructor(error: any) {
    super(
      {
        message: '[InputValidationException] Input data validation failed',
        error,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
