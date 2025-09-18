import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TJwtPayload } from '../auth/type/jwt-payload.type';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { RoomIdPayloadDto } from './dto/room-id-payload.dto';
import { UnauthorizedException } from 'src/common/exception/common.exception';
import { UseWsValidation } from 'src/common/decorator/use-ws-validation.decorator';
import { ChatWsService } from './chat-ws.service';
import { UseWsExceptionFilter } from 'src/common/decorator/use-ws-exception-filter.decorator';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';
import { WS_NAMESPACE_CHAT, WS_SUB_ROOM_JOIN } from 'src/constant/ws.constant';
import { getWsChannel } from 'src/util/ws.util';

@WebSocketGateway({
  namespace: WS_NAMESPACE_CHAT,
  cors: { origin: true, credentials: true },
})
@Injectable()
@UseWsValidation()
@UseWsExceptionFilter()
export class ChatWsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger = new Logger(ChatWsGateway.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly chatWsService: ChatWsService,
  ) {}

  afterInit(_: Server) {}

  async handleConnection(client: Socket) {
    const authHeader = client.handshake.headers['authorization'] as
      | string
      | undefined;
    const tokenToRaw = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : ((client.handshake.auth?.token as string | undefined) ??
        (client.handshake.query?.token as string | undefined));

    if (!tokenToRaw) {
      this.logger.debug('WebSocket auth error: No token provided');
      return client.disconnect(true);
    }
    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync<TJwtPayload>(
        tokenToRaw,
        { secret },
      );

      this.logger.debug(`WebSocket auth success: ${JSON.stringify(payload)}`);

      client.data.userId = payload.sub;
    } catch {
      this.logger.debug('WebSocket auth error: Invalid token');
      client.emit(
        'error',
        JSON.stringify(
          ExceptionResponseDto.fromException(
            new UnauthorizedException(),
            '/chat',
          ),
        ),
      );
      return client.disconnect(true);
    }
  }

  handleDisconnect(_: Socket) {}

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_SUB_ROOM_JOIN),
    description: '클라이언트 → 서버: 방 참여',
    message: {
      payload: RoomIdPayloadDto,
    },
  })
  @SubscribeMessage(WS_SUB_ROOM_JOIN)
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RoomIdPayloadDto,
  ) {
    const userId: string = client.data.userId;

    await this.chatWsService.ensureUserInRoom(userId, body.roomId);

    this.logger.debug(`User ${userId} joining room ${body.roomId}`);

    client.emit('room.joined', { roomId: body.roomId });

    client.join(body.roomId);

    return { ok: true };
  }
}
