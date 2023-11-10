export const LOGGER_MODULE_OPTIONS = Symbol('LOGGER_MODULE_OPTIONS');
export const CLIENT_ID = 'x-client-id';

export const PATHS_TO_REDACT = [
  'req.headers["x-client-secret"]',
  'req.url',
  'err.config.url',
  'req.query.user',
  'req.headers.cookie',
  'req.headers.authorization',
  'res.headers',
];
