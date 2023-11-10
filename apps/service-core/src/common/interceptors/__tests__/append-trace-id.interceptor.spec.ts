import { Test } from '@nestjs/testing';
import { of } from 'rxjs';

import { AppendTraceIdInterceptor } from '../append-trace-id.interceptor';
const executionContext = {
  switchToHttp: jest.fn().mockReturnThis(),
  getClass: jest.fn(),
  getHandler: jest.fn(),
  getArgs: jest.fn(),
  getArgByIndex: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getType: jest.fn(),
  getRequest: jest.fn().mockReturnThis(),
};

describe('AppendTraceIdInterceptor', () => {
  let interceptor: AppendTraceIdInterceptor<any>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AppendTraceIdInterceptor],
    }).compile();

    module.createNestApplication();

    interceptor = module.get(AppendTraceIdInterceptor);
    jest.clearAllMocks();
  });

  it('creates', () => {
    expect(interceptor).toBeDefined();
  });

  it('appends traceId to response', async () => {
    (executionContext.switchToHttp().getRequest as jest.Mock<any, any>).mockReturnValue({
      id: 'test id',
    });
    const testInterceptor$ = interceptor.intercept(executionContext, { handle: () => of('mocked data') });
    testInterceptor$.subscribe({
      next: (alteredResponse) => {
        expect(alteredResponse).toEqual({
          data: 'mocked data',
          traceId: 'test id',
        });
      },
    });
  });
});
