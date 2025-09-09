import { Injectable } from '@nestjs/common';
import { Message } from 'src/entity/message.entity';
import { User } from 'src/entity/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }

  /**
   * 특정 방의 메시지 목록 조회
   */
  async listByRoomId(roomId: string, afterSeq?: number, limit: number = 50) {
    const q = this.createQueryBuilder('m')
      .innerJoinAndMapOne('m.user', User, 'u', 'm.userId = u.id')
      .where('m.roomId = :roomId', { roomId })
      .withDeleted()
      .orderBy('m.seq', 'ASC')
      .limit(limit);

    if (afterSeq !== undefined) {
      q.andWhere('m.seq > :afterSeq', { afterSeq });
    }

    return q.getManyAndCount();
  }
}
