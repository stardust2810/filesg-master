import { CI_ENVIRONMENT, LOG_LEVEL } from '@filesg/common';
import { ModuleMetadata } from '@nestjs/common';
import { Request } from 'express';
import { Session } from 'express-session';

export interface LoggerModuleOptions {
  logLevel: LOG_LEVEL;
  env: CI_ENVIRONMENT;
}

interface User {
  userUuid: string;
}

type AuthUserSession = Session & {
  user: User;
};

interface RequestWithSession extends Request {
  session: AuthUserSession;
}

export interface RequestWithAuthSession extends RequestWithSession {
  headers: {
    'x-client-id': string;
    'x-client-secret': string;
  };
}

export interface LoggerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => LoggerModuleOptions | Promise<LoggerModuleOptions>;
  inject?: any[];
}
