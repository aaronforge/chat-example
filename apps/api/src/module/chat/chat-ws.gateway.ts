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
import { UseWsValidation } from '@api/common/decorator/use-ws-validation.decorator';
import { ExceptionResponseDto } from '@api/common/exception/base.exception';
import {
  WS_NAMESPACE_CHAT,
  WS_EVENT_ROOM_JOIN,
  WS_EVENT_ROOM_LEAVE,
  WS_EVENT_ROOM_EXIT,
  WS_EVENT_MESSAGE_SEND,
  WS_EVENT_ROOM_READ,
  WS_EVENT_ROOM_TYPING_START,
  WS_EVENT_ROOM_TYPING_STOP,
  WS_EVENT_MESSAGE_DELETE,
} from '@api/constant/ws.constant';
import { getWsChannel } from '@api/util/ws.util';
import { OkResponseDto } from '@api/common/dto/ok-response.dto';
import { ackFail } from '@api/util/ack.util';
import { RoomMemberRepository } from '@api/repository/room-member.repository';
import {
  NotInRoomException,
  RoomNotFoundException,
} from '@api/common/exception/room.exception';
import { DataSource } from 'typeorm';
import { Message } from '@api/entity/message.entity';
import { Room } from '@api/entity/room.entity';
import { RoomMember } from '@api/entity/room-member.entity';
import { SendMessagePayloadDto } from './dto/send-message-payload.dto';
import { MessageResponseDto } from '../message/dto/message-response.dto';
import { RoomExitPayloadDto } from './dto/room-exit-payload.dto';
import { RoomReadPayloadDto } from './dto/room-read-payload.dto';
import { MessageRepository } from '@api/repository/message.repository';
import { CurrentWsUserId } from '@api/common/decorator/current-user.decorator';
import { TypingPayloadDto } from './dto/typing-payload.dto';
import { MessageIdPayloadDto } from './dto/message-id-payload.dto';
import { ForbiddenException } from '@api/common/exception/common.exception';
import { MessageDeletePayloadDto } from './dto/message-delete-payload.dto';

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
    private readonly messageRepository: MessageRepository,
    private readonly roomMemberRepository: RoomMemberRepository,
  ) {}

  afterInit(_: Server) {}

  handleConnection(_: Socket) {}

  handleDisconnect(_: Socket) {}

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_JOIN),
    description: '클라이언트 → 서버: 방 참여',
    message: { payload: RoomIdPayloadDto },
  })
  @SubscribeMessage(WS_EVENT_ROOM_JOIN)
  async onJoin(
    @CurrentWsUserId() userId: string,
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const isMember = await this.roomMemberRepository.exists({
      where: { userId, roomId: body.roomId },
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
    message: { payload: RoomIdPayloadDto },
  })
  @SubscribeMessage(WS_EVENT_ROOM_LEAVE)
  async onLeave(
    @CurrentWsUserId() userId: string,
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const isMember = await this.roomMemberRepository.exists({
      where: { userId, roomId: body.roomId },
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
    message: { payload: RoomIdPayloadDto },
  })
  @AsyncApiPub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_EXIT),
    description: '서버 → 클라이언트: 방 나감 알림(탈퇴 등)',
    message: { payload: RoomExitPayloadDto },
  })
  @SubscribeMessage(WS_EVENT_ROOM_EXIT)
  async onExit(
    @CurrentWsUserId() userId: string,
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
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

    const exitResponse = new RoomExitPayloadDto({
      roomId: body.roomId,
      userId,
    });
    this.server.to(body.roomId).emit(WS_EVENT_ROOM_EXIT, exitResponse);

    return { ok: result.affected > 0 };
  }

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_MESSAGE_SEND),
    description: '클라이언트 → 서버: 메시지 전송',
    message: { payload: SendMessagePayloadDto },
  })
  @AsyncApiPub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_MESSAGE_SEND),
    description: '서버 → 클라이언트: 메시지 수신',
    message: { payload: MessageResponseDto },
  })
  @SubscribeMessage(WS_EVENT_MESSAGE_SEND)
  async onMessage(
    @CurrentWsUserId() userId: string,
    @MessageBody() body: SendMessagePayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const { roomId } = body;

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

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_MESSAGE_DELETE),
    description: '클라이언트 → 서버: 메시지 삭제',
    message: { payload: OkResponseDto },
  })
  @AsyncApiPub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_MESSAGE_DELETE),
    description: '서버 → 클라이언트: 메시지 삭제 알림',
    message: { payload: MessageResponseDto },
  })
  @SubscribeMessage(WS_EVENT_MESSAGE_DELETE)
  async onMessageDelete(
    @CurrentWsUserId() userId: string,
    @MessageBody() body: MessageIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const { messageId } = body;
    const message = await this.messageRepository.findOne({
      where: { id: messageId, userId },
    });

    if (!message) {
      return ackFail(
        new NotInRoomException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_MESSAGE_DELETE,
      );
    }

    if (message.userId !== userId) {
      return ackFail(
        new ForbiddenException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_MESSAGE_DELETE,
      );
    }

    await this.messageRepository.softDelete({ id: messageId });

    this.server.to(message.roomId).emit(
      WS_EVENT_MESSAGE_DELETE,
      new MessageDeletePayloadDto({
        roomId: message.roomId,
        messageId,
      }),
    );

    return { ok: true };
  }

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_READ),
    description: '클라이언트 → 서버: 메시지 읽음 처리',
    message: { payload: RoomReadPayloadDto },
  })
  @SubscribeMessage(WS_EVENT_ROOM_READ)
  async onRead(
    @CurrentWsUserId() userId: string,
    @MessageBody() body: RoomReadPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const { roomId, upToSeq } = body;

    const member = await this.roomMemberRepository.findOne({
      where: { roomId, userId },
    });
    if (!member) {
      return ackFail(
        new NotInRoomException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_ROOM_READ,
      );
    }

    const last = await this.messageRepository.findOne({
      where: { roomId },
      order: { seq: 'DESC' },
    });
    const lastSeq = last ? last.seq : 0;
    const next = Math.min(upToSeq, lastSeq);

    if (next !== member.lastReadSeq) {
      await this.roomMemberRepository.update(
        { roomId, userId },
        { lastReadSeq: next },
      );
    }

    return { ok: true };
  }

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_TYPING_START),
    description: '클라이언트 → 서버: 타이핑 시작',
    message: { payload: RoomIdPayloadDto },
  })
  @AsyncApiPub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_TYPING_START),
    description: '서버 → 클라이언트: 타이핑 시작 알림',
    message: { payload: TypingPayloadDto },
  })
  @SubscribeMessage(WS_EVENT_ROOM_TYPING_START)
  async onTypingStart(
    @CurrentWsUserId() userId: string,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const { roomId } = body;
    const isMember = await this.roomMemberRepository.exists({
      where: { userId, roomId },
    });
    if (!isMember) {
      return ackFail(
        new NotInRoomException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_ROOM_TYPING_START,
      );
    }

    this.server
      .to(roomId)
      .emit(
        WS_EVENT_ROOM_TYPING_START,
        new TypingPayloadDto({ roomId, userId, isTyping: true }),
      );

    this.logger.debug(`User ${userId} is typing in room ${roomId}`);

    return { ok: true };
  }

  @AsyncApiSub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_TYPING_STOP),
    description: '클라이언트 → 서버: 타이핑 중지',
    message: { payload: RoomIdPayloadDto },
  })
  @AsyncApiPub({
    channel: getWsChannel(WS_NAMESPACE_CHAT, WS_EVENT_ROOM_TYPING_STOP),
    description: '서버 → 클라이언트: 타이핑 중지 알림',
    message: { payload: TypingPayloadDto },
  })
  @SubscribeMessage(WS_EVENT_ROOM_TYPING_STOP)
  async onTypingStop(
    @CurrentWsUserId() userId: string,
    @MessageBody() body: RoomIdPayloadDto,
  ): Promise<OkResponseDto | ExceptionResponseDto> {
    const { roomId } = body;
    const isMember = await this.roomMemberRepository.exists({
      where: { userId, roomId },
    });
    if (!isMember) {
      return ackFail(
        new NotInRoomException(),
        WS_NAMESPACE_CHAT,
        WS_EVENT_ROOM_TYPING_STOP,
      );
    }

    this.server
      .to(roomId)
      .emit(
        WS_EVENT_ROOM_TYPING_STOP,
        new TypingPayloadDto({ roomId, userId, isTyping: false }),
      );

    this.logger.debug(`User ${userId} stopped typing in room ${roomId}`);
    return { ok: true };
  }
}
