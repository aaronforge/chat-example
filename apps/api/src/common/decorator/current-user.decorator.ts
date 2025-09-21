import { TJwtPayload } from '@api/module/auth/type/jwt-payload.type';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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

export const CurrentWsUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    return client.data.user as TJwtPayload | undefined;
  },
);

export const CurrentWsUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    return (client.data.user?.sub as string) || undefined;
  },
);
