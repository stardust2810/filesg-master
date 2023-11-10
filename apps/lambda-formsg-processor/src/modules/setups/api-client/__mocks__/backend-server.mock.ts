import { rest, RestHandler } from 'msw';
import { setupServer } from 'msw/node';

import { mockFileSGConfigService } from '../../config/__mocks__/config.mock';

const { systemConfig } = mockFileSGConfigService;

export enum MockCoreApiOperation {
  CreateFormsgTransaction = 'CreateFormsgTransaction',
}

export enum MockEventLogsApiOperation {
  PublishEvent = 'PublishEvent',
}

export enum MockTransferApiOperation {
  UploadFile = 'UploadFile',
}

type MockApiOperation = MockCoreApiOperation | MockEventLogsApiOperation | MockTransferApiOperation;
type MockResponse = Record<MockApiOperation, { status: number; data: any }>;

const mockResponseData: MockResponse = {
  CreateFormsgTransaction: {
    status: 200,
    data: {},
  },
  UploadFile: {
    status: 200,
    data: 'Successfully uploaded file(s)',
  },
  PublishEvent: {
    status: 204,
    data: undefined,
  },
};

export const mockApiResponse = (apiOperation: MockApiOperation, status: number, data: any) => {
  mockResponseData[apiOperation] = { status, data };
};

const mockApiHandlers: Record<MockApiOperation, RestHandler> = {
  // Core Api
  CreateFormsgTransaction: rest.post(`${systemConfig.coreServiceUrl}/v1/formsg/transaction/issuance/single`, (req, res, ctx) => {
    return res(ctx.status(mockResponseData.CreateFormsgTransaction.status), ctx.json(mockResponseData.CreateFormsgTransaction.data));
  }),
  // Transfer Api
  UploadFile: rest.post(`${systemConfig.transferServiceUrl}/v1/file-upload`, (req, res, ctx) => {
    return res(ctx.status(mockResponseData.UploadFile.status), ctx.json(mockResponseData.UploadFile.data));
  }),
  // Event Logs Api
  PublishEvent: rest.post(`${systemConfig.eventLogsServiceUrl}/v1/events`, (req, res, ctx) => {
    return res(ctx.status(mockResponseData.PublishEvent.status), ctx.json(mockResponseData.PublishEvent.data));
  }),
};

export const mockServer = setupServer(...Object.values(mockApiHandlers));
