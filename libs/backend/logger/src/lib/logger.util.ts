import { CI_ENVIRONMENT, LOG_LEVEL, redactUinfin } from '@filesg/common';
import { Params } from 'nestjs-pino';
import pino from 'pino';
import { v4 as uuid4 } from 'uuid';

import { CLIENT_ID, PATHS_TO_REDACT } from './logger.const';
import { RequestWithAuthSession } from './logger.typing';

const REDACTED_VALUE = '<REDACTED-VALUE>';

export const getPinoLoggerConfig = (logLevel: LOG_LEVEL, env: CI_ENVIRONMENT): Params => ({
  pinoHttp: {
    autoLogging: {
      ignorePaths: ['/health-check'],
    },
    level: logLevel,
    ...(env !== 'local' && {
      logger: pino({
        formatters: {
          level: (label) => ({ level: label }),
        },
        redact: {
          paths: PATHS_TO_REDACT,
          censor: (value, path) => {
            if (path.join('.') === 'res.headers') {
              return undefined;
            }
            // redact uin
            if (['url', 'user'].includes(path.pop()!)) {
              return redactUinfin(value);
            }

            return REDACTED_VALUE;
          },
        },
      }),
    }),
    genReqId: () => uuid4(),
    timestamp: () => `,"time": "${new Date().toLocaleString()}"`,
    reqCustomProps: (req) => {
      const { session, sessionID, headers } = req as RequestWithAuthSession;
      const customProp: { sessionId: string; userUuid?: string } = { sessionId: sessionID };
      if (headers[CLIENT_ID]) {
        customProp.userUuid = headers[CLIENT_ID];
      } else if (session?.user?.userUuid) {
        customProp.userUuid = session?.user?.userUuid;
      }
      return customProp;
    },
    customLogLevel: function (res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'silent';
      }
      return 'info';
    },
    transport:
      env === 'local'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'req.remotePort,req.headers',
            },
          }
        : undefined, // only local will show the json in pretty format
  },
});
