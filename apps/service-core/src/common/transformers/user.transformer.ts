import { maskUin } from '@filesg/backend-common';
import { BasicUserResponse, DetailUserResponse } from '@filesg/common';

import { User } from '../../entities/user';

// =============================================================================
// Defaults
// =============================================================================
function transformBasicUser(user: User): BasicUserResponse {
  return {
    uuid: user.uuid,
    name: user.name,
    type: user.type,
    role: user.role,
    isOnboarded: user.isOnboarded,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export function transformDetailUser(user: User): DetailUserResponse {
  return {
    ...transformBasicUser(user),
    email: user.email,
    phoneNumber: user.phoneNumber,
    lastLoginAt: user.lastLoginAt,
    maskedUin: user.uin ? maskUin(user.uin) : null,
  };
}

// =============================================================================
// Service-based
// =============================================================================
