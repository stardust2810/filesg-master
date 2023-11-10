import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_DISABLED_KEY } from '../decorators/disabled.decorator';
import { ForbiddenException } from '../filters/custom-exception.filter';

@Injectable()
export class DisableHandlerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handlerFn = context.getHandler();
    const controllerClass = context.getClass();

    const isDisabled = this.reflector.getAllAndOverride<boolean>(IS_DISABLED_KEY, [handlerFn, controllerClass]);

    if (isDisabled === true) {
      throw new ForbiddenException(COMPONENT_ERROR_CODE.DISABLE_HANDLER_GUARD);
    }
    return true;
  }
}
