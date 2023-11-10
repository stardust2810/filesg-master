import { EntityManager } from 'typeorm';

import { JWT_TYPE } from '../constants/common.constant';

export interface ServiceMethodOptions {
  entityManager?: EntityManager;
  toThrow?: boolean;
}

export interface ServiceMethodThrowOptions {
  entityManager?: EntityManager;
  toThrow?: true;
}

export interface ServiceMethodDontThrowOptions {
  entityManager?: EntityManager;
  toThrow?: false;
}

export interface JwtPayload {
  type: JWT_TYPE;
}

export interface FileUploadJwtPayload extends JwtPayload {
  transactionUuid: string;
}
