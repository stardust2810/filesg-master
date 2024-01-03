import { ROLE } from '@filesg/common';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiHeaders } from '@nestjs/swagger';

export enum AUTH_STATE {
  NO_LOGGED_IN = 'NO_LOGGED_IN',
  CITIZEN_LOGGED_IN = 'CITIZEN_LOGGED_IN',
  CORPORATE_USER_LOGGED_IN = 'CORPORATE_USER_LOGGED_IN',
  PROGRAMMATIC_LOGGED_IN = 'PROGRAMMATIC_LOGGED_IN',
  JWT = 'JWT',
}

const API_HEADER_DESCRIPTION = 'Issued to agency by FileSG after completion of onboarding process.';

export interface AuthInterface {
  auth_state: AUTH_STATE;
  roles?: ROLE[];
  requireOnboardedUser?: boolean;
}

export const AUTH_KEY = 'auth';

const AuthMetadata = (required: AuthInterface) => SetMetadata(AUTH_KEY, required);

export function FileSGAuth(auth: AuthInterface) {
  const decorators: Parameters<typeof applyDecorators> = [AuthMetadata(auth)];

  if (auth.auth_state === AUTH_STATE.PROGRAMMATIC_LOGGED_IN) {
    decorators.push(
      ...[
        ApiHeaders([
          { name: 'x-client-id', description: API_HEADER_DESCRIPTION },
          { name: 'x-client-secret', description: API_HEADER_DESCRIPTION },
        ]),
      ],
    );
  }

  return applyDecorators(...decorators);
}
