export const mockSingpassHelper = {
  constructAuthorizationUrl: jest.fn(),
  getTokens: jest.fn(),
  getIdTokenPayload: jest.fn(),
  extractNricAndUuidFromPayload: jest.fn(),
};

export const mockMyInfoHelper = {
  getPersonBasic: jest.fn(),
};
