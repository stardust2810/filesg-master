export const mockEventLogsServiceClientProvider = {
  get: jest.fn(),
  post: jest.fn(),
};

export const mockApexClientProvider = {
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

export const mockMyIcaClientProvider = {
  post: jest.fn(),
};

export const mockMccApiClientProvider = {
  post: jest.fn(),
};
