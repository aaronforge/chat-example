import { Injectable, Logger } from '@nestjs/common';
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
import { AsyncApiSub } from 'nestjs-asyncapi';
import { RoomIdPayloadDto } from './dto/room-id-payload.dto';
import { UseWsValidation } from 'src/common/decorator/use-ws-validation.decorator';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';
import {
  WS_NAMESPACE_CHAT,
  WS_EVENT_ROOM_JOIN,
  WS_EVENT_ROOM_LEAVE,
  WS_EVENT_ROOM_EXIT,
} from 'src/constant/ws.constant';
import { getWsChannel } from 'src/util/ws.util';
import { OkResponseDto } from 'src/common/dto/ok-response.dto';
import { ackFail } from 'src/util/ack.util';
import { RoomMemberRepository } from 'src/repository/room-member.repository';
import { NotInRoomException } from 'src/common/exception/room.exception';

@WebSocketGateway({
  namespace: WS_NAMESPACE_CHAT,
  cors: { origin: true, credentials: true },
})
@Injectable()
@UseWsValidation()
export class ChatWsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger = new Logger(ChatWsGateway.name);
  constructor(private readonly roomMemberRepository: RoomMemberRepository) {}

  afterInit(_: Server) {}

  handleConnection(_: Socket) {}

  handleDisconnect(_: Socket) {}

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_JOIN),
    description: '클라이언트 → 서버: 방 참여',
    message: {
      payload: RoomIdPayloadDto,
    },
  })
  @SubscribeMessage(WS_EVENT_ROOM_JOIN)
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const userId: string = client.data.userId;

    const isMember = await this.roomMemberRepository.exists({
      where: {
        userId,
        roomId: body.roomId,
      },
    });

    if (!isMember) {
      return ackFail(
        new NotInRoomException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_ROOM_JOIN,
      );
    }

    await client.join(body.roomId);

    this.logger.debug(`User ${userId} joined room ${body.roomId}`);

    return { ok: isMember };
  }

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_LEAVE),
    description: '클라이언트 → 서버: 방 나가기(뒤로가기 등)',
    message: {
      payload: RoomIdPayloadDto,
    },
  })
  @SubscribeMessage(WS_EVENT_ROOM_LEAVE)
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const userId: string = client.data.userId;

    const isMember = await this.roomMemberRepository.exists({
      where: {
        userId,
        roomId: body.roomId,
      },
    });

    if (!isMember) {
      return ackFail(
        new NotInRoomException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_ROOM_LEAVE,
      );
    }

    await client.leave(body.roomId);

    this.logger.debug(`User ${userId} left room ${body.roomId}`);

    return { ok: isMember };
  }

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_EXIT),
    description: '클라이언트 → 서버: 방 나가기(멤버 탈퇴 등)',
    message: {
      payload: RoomIdPayloadDto,
    },
  })
  @SubscribeMessage(WS_EVENT_ROOM_EXIT)
  async onExit(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const userId: string = client.data.userId;

    const result = await this.roomMemberRepository.softDelete({
      roomId: body.roomId,
      userId,
    });

    if (!result.affected || result.affected <= 0) {
      return ackFail(
        new NotInRoomException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_ROOM_EXIT,
      );
    }

    await client.leave(body.roomId);

    this.logger.debug(`User ${userId} exited room ${body.roomId}`);

    return { ok: result.affected > 0 };
  }
}
