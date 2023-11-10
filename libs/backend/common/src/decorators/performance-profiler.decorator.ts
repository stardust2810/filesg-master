import { Logger } from '@nestjs/common';

/**
 * Adding this decorator will print out the timing from the start to end of the method
 */
export const PerformanceProfiler =
  () =>
  (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = new Date().getTime();

      const result = await originalMethod.apply(this, args);

      new Logger('PerformanceProfiler').debug(`[Profiling][${propertyKey}] Time taken: ${new Date().getTime() - startTime} ms`);
      return result;
    };

    return descriptor;
  };
