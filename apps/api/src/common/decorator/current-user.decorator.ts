import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TJwtPayload } from 'src/module/auth/type/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as TJwtPayload | undefined;
  },
);

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return (req.user?.sub as string) || undefined;
  },
);
