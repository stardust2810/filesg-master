import { setupServer } from 'msw/node';

import { handlers } from './server-handlers';

/**
 * This server is used for running mocks for tests
 * For more informatio, refer to https://www.wwt.com/article/using-mock-service-worker-to-improve-jest-unit-tests
 */
export const mswServer = setupServer(...handlers);
