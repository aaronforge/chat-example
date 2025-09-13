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

@Injectable()
export class RoomService {
  private logger = new Logger(RoomService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly roomRepository: RoomRepository,
    private readonly roomMemberRepository: RoomMemberRepository,
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
    return {
      list: list.filter((rm) => !!rm.room).map((rm) => rm.room!),
      total,
    };
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
}
