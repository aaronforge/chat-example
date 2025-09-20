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
import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import { RoomIdPayloadDto } from './dto/room-id-payload.dto';
import { UseWsValidation } from 'src/common/decorator/use-ws-validation.decorator';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';
import {
  WS_NAMESPACE_CHAT,
  WS_EVENT_ROOM_JOIN,
  WS_EVENT_ROOM_LEAVE,
  WS_EVENT_ROOM_EXIT,
  WS_EVENT_MESSAGE_SEND,
} from 'src/constant/ws.constant';
import { getWsChannel } from 'src/util/ws.util';
import { OkResponseDto } from 'src/common/dto/ok-response.dto';
import { ackFail } from 'src/util/ack.util';
import { RoomMemberRepository } from 'src/repository/room-member.repository';
import {
  NotInRoomException,
  RoomNotFoundException,
} from 'src/common/exception/room.exception';
import { DataSource } from 'typeorm';
import { Message } from 'src/entity/message.entity';
import { Room } from 'src/entity/room.entity';
import { RoomMember } from 'src/entity/room-member.entity';
import { SendMessagePayloadDto } from './dto/send-message-payload.dto';
import { MessageResponseDto } from '../message/dto/message-response.dto';
import { RoomExitResponseDto } from './dto/room-exit-response.dto';

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
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomMemberRepository: RoomMemberRepository,
  ) {}

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
  @AsyncApiPub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_EXIT),
    description: '서버 → 클라이언트: 방 나감 알림(탈퇴 등)',
    message: {
      payload: RoomExitResponseDto,
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

    const exitResponse: RoomExitResponseDto = {
      roomId: body.roomId,
      userId,
    };

    this.server.to(body.roomId).emit(WS_EVENT_ROOM_EXIT, exitResponse);

    return { ok: result.affected > 0 };
  }

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_MESSAGE_SEND),
    description: '클라이언트 → 서버: 메시지 전송',
    message: {
      payload: SendMessagePayloadDto,
    },
  })
  @AsyncApiPub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_MESSAGE_SEND),
    description: '서버 → 클라이언트: 메시지 수신',
    message: {
      payload: MessageResponseDto,
    },
  })
  @SubscribeMessage(WS_EVENT_MESSAGE_SEND)
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendMessagePayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const { roomId } = body;
    const userId: string = client.data.userId;

    const message = await this.dataSource.transaction(async (em) => {
      const messageRepo = em.getRepository(Message);
      const roomRepo = em.getRepository(Room);
      const memberRepo = em.getRepository(RoomMember);

      // 방 멤버 확인
      const member = await memberRepo.exists({
        where: { roomId, userId },
      });
      if (!member) {
        return ackFail(
          new NotInRoomException(),
          WS_NAMESPACE_CHAT,
          WS_EVENT_MESSAGE_SEND,
        );
      }

      // 멱등성 확인
      const dup = await messageRepo.findOne({
        where: { roomId, clientMsgId: body.clientMsgId, userId },
      });
      if (dup) return dup;

      // 방 존재 확인
      const room = await roomRepo.findOne({ where: { id: roomId } });
      if (!room) {
        return ackFail(
          new RoomNotFoundException(),
          WS_NAMESPACE_CHAT,
          WS_EVENT_MESSAGE_SEND,
        );
      }

      // lastSeq +1
      await roomRepo.update({ id: roomId }, { lastSeq: () => 'lastSeq + 1' });

      const next = await roomRepo.findOne({ where: { id: roomId } });
      const seq = next!.lastSeq;

      // 메시지 생성
      return messageRepo.save(
        messageRepo.create({
          roomId,
          userId,
          type: body.type,
          content: body.content,
          clientMsgId: body.clientMsgId,
          seq,
        }),
      );
    });

    if (message instanceof Message) {
      this.server.to(roomId).emit(WS_EVENT_MESSAGE_SEND, {
        roomId,
        message: MessageResponseDto.fromEntity(message),
      });

      return { ok: true };
    }

    return message;
  }
}
