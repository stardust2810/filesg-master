import '@testing-library/jest-dom';

import { mswServer } from './server';

beforeAll(() => mswServer.listen());
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());
