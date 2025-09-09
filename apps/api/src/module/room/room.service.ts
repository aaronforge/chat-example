import { Injectable, Logger } from '@nestjs/common';
import { OkResponseDto } from 'src/common/dto/ok-response.dto';
import { NotInRoomException } from 'src/common/exception/room.exception';
import { Room } from 'src/entity/room.entity';
import { RoomMemberRepository } from 'src/repository/room-member.repository';
import { RoomRepository } from 'src/repository/room.repository';

@Injectable()
export class RoomService {
  private logger = new Logger(RoomService.name);

  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly roomMemberRepository: RoomMemberRepository,
  ) {}

  async listMyRooms(userId: string): Promise<Room[]> {
    const roomMembers = await this.roomMemberRepository.listRoomsByUser(userId);
    return roomMembers.filter((rm) => !!rm.room).map((rm) => rm.room!);
  }

  async leaveRoom(userId: string, roomId: string): Promise<OkResponseDto> {
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
