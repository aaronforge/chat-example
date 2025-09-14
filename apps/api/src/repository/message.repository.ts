import { Injectable } from '@nestjs/common';
import { Message } from 'src/entity/message.entity';
import { RoomMember } from 'src/entity/room-member.entity';
import { DataSource, In, LessThan, MoreThan, Repository } from 'typeorm';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }

  /**
   * 특정 방의 메시지 목록 조회
   */
  async listByRoomId(roomId: string, beforeSeq?: number, limit: number = 50) {
    return this.findAndCount({
      where: {
        roomId,
        // seq: beforeSeq === undefined ? undefined : MoreThan(beforeSeq),
        seq: beforeSeq ? LessThan(beforeSeq) : undefined,
      },
      order: { seq: 'DESC' },
      take: limit,
      withDeleted: true,
    });
  }

  /**
   * 특정 방의 읽지 않은 메시지 수 조회
   */
  async countUnreadByRooms(userId: string, roomIds: string[]) {
    const map = new Map<string, number>();

    if (roomIds.length === 0) return map;

    const result = await this.createQueryBuilder('m')
      .innerJoin(
        RoomMember,
        'rm',
        'rm.roomId = m.roomId AND rm.userId = :userId',
        { userId },
      )
      .select('m.roomId', 'roomId')
      .addSelect('COUNT(*)', 'unreadCount')
      .where('m.roomId IN (:...roomIds)', { roomIds })
      .andWhere('m.seq > COALESCE(rm.lastReadSeq, 0)')
      .groupBy('m.roomId')
      .getRawMany<{ roomId: string; unreadCount: string }>();

    result.forEach((r) => {
      map.set(r.roomId, Number(r.unreadCount));
    });

    return map;
  }
}
