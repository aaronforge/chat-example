import { Injectable, Logger } from '@nestjs/common';
import { NotInRoomException } from 'src/common/exception/room.exception';
import { RoomMemberRepository } from 'src/repository/room-member.repository';
import { RoomRepository } from 'src/repository/room.repository';

@Injectable()
export class RoomService {
  private logger = new Logger(RoomService.name);

  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly roomMemberRepository: RoomMemberRepository,
  ) {}

  /**
   * 내가 속한 방 목록 조회
   */
  async listMyRooms(userId: string) {
    const [list, total] =
      await this.roomMemberRepository.listRoomsByUser(userId);
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
