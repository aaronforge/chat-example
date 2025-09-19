import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExtendedError, Server, Socket } from 'socket.io';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  constructor(
    private app: INestApplication,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any) {
    const server: Server = super.createIOServer(port, options);

    const authMiddleware = async (
      socket: Socket,
      next: (err?: ExtendedError | undefined) => void,
    ) => {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        (socket.handshake.headers['authorization'] as string)?.replace(
          'Bearer ',
          '',
        );

      if (!token) return next(new UnauthorizedException('No token provided'));

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        socket.data.userId = payload.sub;
        next();
      } catch {
        return next(new UnauthorizedException('Invalid token'));
      }
    };

    // 루트 네임스페이스
    server.use(authMiddleware);

    // 기존/추가 네임스페이스에도 동일 적용
    const originalOf = server.of.bind(server);
    server.of = (name: string) => {
      const namespace = originalOf(name);
      namespace.use(authMiddleware);
      return namespace;
    };

    return server;
  }
}
