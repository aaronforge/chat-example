import { applyDecorators, UseFilters } from '@nestjs/common';
import { WsAllExceptionFilter } from '../filter/ws-all-exception.filter';

export const UseWsExceptionFilter = () =>
  applyDecorators(UseFilters(new WsAllExceptionFilter()));
