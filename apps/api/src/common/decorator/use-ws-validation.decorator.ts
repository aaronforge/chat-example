import { applyDecorators, UsePipes } from '@nestjs/common';
import { ValidationConfig } from '@api/config/validation.config';

export const UseWsValidation = () =>
  applyDecorators(UsePipes(ValidationConfig));
