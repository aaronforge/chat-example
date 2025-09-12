import { Injectable } from '@nestjs/common';
import { Message } from 'src/entity/message.entity';
import { DataSource, LessThan, Repository } from 'typeorm';

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
}
