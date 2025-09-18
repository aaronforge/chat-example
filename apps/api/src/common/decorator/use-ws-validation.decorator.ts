import { applyDecorators, UsePipes } from '@nestjs/common';
import { ValidationConfig } from 'src/config/validation.config';

export const UseWsValidation = () =>
  applyDecorators(UsePipes(ValidationConfig));
