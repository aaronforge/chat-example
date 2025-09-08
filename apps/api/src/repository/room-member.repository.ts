import { Injectable } from '@nestjs/common';
import { Message } from 'src/entity/message.entity';
import { RoomMember } from 'src/entity/room-member.entity';
import { Room } from 'src/entity/room.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RoomMemberRepository extends Repository<RoomMember> {
  constructor(private dataSource: DataSource) {
    super(RoomMember, dataSource.createEntityManager());
  }

  async listRoomsByUser(userId: string) {
    return this.createQueryBuilder('rm')
      .leftJoinAndMapOne('rm.room', Room, 'r', 'rm.roomId = r.id')
      .leftJoinAndMapOne(
        'r.lastMessage',
        Message,
        'lm',
        'lm.roomId = r.id AND lm.seq = r.lastSeq',
      )
      .where('rm.userId = :userId', { userId })
      .orderBy('lm.createdAt', 'DESC')
      .addOrderBy('r.updatedAt', 'DESC')
      .getMany();
  }
}
