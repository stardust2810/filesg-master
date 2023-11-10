import { redactUinfin } from '@filesg/common';
import { Logger } from '@nestjs/common';

interface LogMethodArgs {
  customMsg?: string;
  keysToRedact?: string[];
}

/*
 * The replacer parameter allows you to specify a function that replaces values with your own.
 * We can use it to control what gets stringified.
 */
function replacer(key: string, value: any, keysToRedact?: string[]) {
  try {
    if (keysToRedact?.includes(key)) {
      return '<REDACTED-VALUE>';
    }
    // This is a brute force way to test if a value is stringified-able
    JSON.stringify(value);

    return value;
  } catch (err) {
    return '<NON-STRINGIFY-ABLE-VALUE>';
  }
}

export function LogMethod({ customMsg = '', keysToRedact }: LogMethodArgs = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const className = target.constructor.name;
    const originalMethod = descriptor.value;
    const logger = new Logger(className);

    descriptor.value = function (...args: any[]) {
      let messageToLog = `[${className}.${propertyKey}](`;

      for (let x = 0; x < args.length; x++) {
        messageToLog += JSON.stringify(args[x], (key, value) => replacer(key, value, keysToRedact));
        messageToLog += x < args.length - 1 ? ',' : '';
      }

      messageToLog += `); ${customMsg}`;
      messageToLog = redactUinfin(messageToLog);

      logger.log(messageToLog);
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
