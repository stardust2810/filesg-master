import { FEATURE_TOGGLE } from '@filesg/common';

export interface MockReturn {
  value: any;
}

export const PerformanceTestMethodReturnMock =
  (mockReturn: MockReturn) =>
  (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    if (process.env['TOGGLE_PERFORMANCE_TEST'] === FEATURE_TOGGLE.ON) {
      descriptor.value = async function () {
        return mockReturn.value;
      };
    }

    return descriptor;
  };
