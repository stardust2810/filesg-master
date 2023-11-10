import { SetMetadata } from '@nestjs/common';

export const IS_DISABLED_KEY = 'isDisabled';
export const Disabled = () => SetMetadata(IS_DISABLED_KEY, true);
