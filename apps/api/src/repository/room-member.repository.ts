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

  /**
   * 특정 사용자가 속한 방 목록 조회
   * - 최근 메시지와 함께 반환
   * - 최근 메시지 기준 내림차순 정렬
   * - 최근 메시지가 없을 경우 방의 업데이트 시간 기준 내림차순 정렬
   */
  async listRoomsByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    return this.createQueryBuilder('rm')
      .leftJoinAndMapOne('rm.room', Room, 'r', 'rm.roomId = r.id')
      .leftJoinAndMapOne(
        'r.lastMessage',
        Message,
        'lm',
        'lm.roomId = r.id AND lm.seq = r.lastSeq',
      )
      .take(limit)
      .skip(offset)
      .where('rm.userId = :userId', { userId })
      .orderBy('lm.seq', 'DESC', 'NULLS LAST')
      .addOrderBy('r.updatedAt', 'DESC')
      .getManyAndCount();
  }
}
