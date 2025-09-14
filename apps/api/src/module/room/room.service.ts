import { Injectable, Logger } from '@nestjs/common';
import {
  NeedAtLeastTwoMembersException,
  NotInRoomException,
} from 'src/common/exception/room.exception';
import { RoomMemberRepository } from 'src/repository/room-member.repository';
import { RoomRepository } from 'src/repository/room.repository';
import { CreateRoomDto } from './dto/create-room.dto';
import { DataSource } from 'typeorm';
import { Room } from 'src/entity/room.entity';
import { RoomMember } from 'src/entity/room-member.entity';
import { ListRoomQueryDto } from './dto/list-room.dto';
import { Message } from 'src/entity/message.entity';
import { MessageRepository } from 'src/repository/message.repository';

@Injectable()
export class RoomService {
  private logger = new Logger(RoomService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly roomRepository: RoomRepository,
    private readonly roomMemberRepository: RoomMemberRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  /**
   * 방 생성
   */
  async createRoom(creatorId: string, dto: CreateRoomDto) {
    return this.dataSource.transaction(async (em) => {
      const uniq = [...new Set([...dto.memberIds, creatorId])];
      if (uniq.length < 2) throw new NeedAtLeastTwoMembersException();

      const roomRepo = em.getRepository(Room);
      const memberRepo = em.getRepository(RoomMember);

      const room = await roomRepo.save(
        roomRepo.create({
          title: dto.title || undefined,
          lastSeq: 0,
        }),
      );

      const members = uniq.map((uid) =>
        memberRepo.create({
          roomId: room.id,
          userId: uid,
          lastReadSeq: 0,
        }),
      );
      await memberRepo.save(members);

      return room;
    });
  }

  /**
   * 내가 속한 방 목록 조회
   */
  async listMyRooms(userId: string, dto: ListRoomQueryDto) {
    const [list, total] = await this.roomMemberRepository.listRoomsByUser(
      userId,
      dto.limit,
      dto.offset,
    );
    const rooms = list.filter((rm) => !!rm.room).map((rm) => rm.room!);
    const roomIds = rooms.map((r) => r.id);
    if (roomIds.length === 0) {
      return { list: [], total: 0 };
    }

    // 내가 속한 방의 멤버들 일괄 조회
    const members = await this.roomMemberRepository.listMembersPreviewByRooms(
      roomIds,
      dto.numOfPreviewMembers || 4,
    );

    // 안 읽은 수 계산
    const unreadMap = await this.messageRepository.countUnreadByRooms(
      userId,
      roomIds,
    );

    return {
      list: rooms.map((room) => {
        const roomId = room.id;
        const membersInfo = members.get(roomId);

        return {
          room,
          members: membersInfo?.users || [],
          numOfMembers: membersInfo?.total || 0,
          numOfUnreadMessages: unreadMap.get(roomId) || 0,
        };
      }),
      total,
    };
  }

  /**
   * 멤버 목록
   */
  async listMembers(userId: string, roomId: string) {
    const member = await this.roomMemberRepository.findOne({
      where: { roomId, userId },
    });
    if (!member) throw new NotInRoomException();

    return this.roomMemberRepository.listMembersByRoom(member.roomId);
  }

  /**
   * 방 나가기
   */
  async leaveRoom(userId: string, roomId: string) {
    const member = await this.roomMemberRepository.findOne({
      where: { userId, roomId },
    });
    if (!member) throw new NotInRoomException();

    await this.roomMemberRepository.softDelete({ userId, roomId });

    const remaining = await this.roomMemberRepository.count({
      where: { roomId },
    });
    if (remaining === 0) {
      await this.roomRepository.softDelete({ id: roomId });
    }

    return { ok: true };
  }

  /**
   * 읽음 처리: upToSeq 까지 갱신(max 보장)
   */
  async markRead(userId: string, roomId: string, upToSeq: number) {
    return this.dataSource.transaction(async (em) => {
      const memberRepo = em.getRepository(RoomMember);
      const me = await memberRepo.findOne({ where: { roomId, userId } });
      if (!me) throw new NotInRoomException();

      const messageRepo = em.getRepository(Message);
      const lastMsg = await messageRepo.findOne({
        where: { roomId },
        order: { seq: 'DESC' },
      });

      const lastSeq = lastMsg ? lastMsg.seq : 0;
      const next = Math.min(Math.max(me.lastReadSeq, upToSeq), lastSeq);
      if (next !== me.lastReadSeq) {
        await memberRepo.update({ roomId, userId }, { lastReadSeq: next });
      }

      return { lastReadSeq: next };
    });
  }
}
