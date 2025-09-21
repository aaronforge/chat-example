import { Injectable } from '@nestjs/common';
import { Message } from '@api/entity/message.entity';
import { RoomMember } from '@api/entity/room-member.entity';
import { Room } from '@api/entity/room.entity';
import { User } from '@api/entity/user.entity';
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

  private getBaseQuery() {
    const query = this.createQueryBuilder('rm').leftJoinAndMapOne(
      'rm.user',
      User,
      'u',
      'rm.userId = u.id',
    );

    return query.orderBy('rm.createdAt', 'ASC');
  }

  /**
   * 특정 방의 멤버 목록 조회
   * - 생성일 기준 오름차순 정렬
   * - User 엔티티와 조인하여 유저 정보 포함
   */
  async listMembersByRoom(roomId: string) {
    return this.getBaseQuery()
      .where('rm.roomId = :roomId', { roomId })
      .getMany();
  }

  /**
   * 여러 방의 멤버 미리보기 조회
   */
  async listMembersPreviewByRooms(roomIds: string[], limitPerRoom: number) {
    const map = new Map<string, { users: User[]; total: number }>();
    if (roomIds.length === 0) return map;

    // 1) 서브쿼리: 방별 순번(rn) + 총원(total)
    const sub = this.manager
      .createQueryBuilder()
      .select([
        'm.user_id AS user_id',
        'm.room_id AS room_id',
        `ROW_NUMBER() OVER (PARTITION BY m."room_id" ORDER BY m."created_at" ASC) AS rn`,
        `COUNT(*)    OVER (PARTITION BY m."room_id") AS total`,
      ])
      .from(RoomMember, 'm')
      .where('m.room_id IN (:...roomIds)', { roomIds });

    // 2) 외부 쿼리: rn<=N만 남기고 User 조인
    const rows = await this.manager
      .createQueryBuilder()
      .from('(' + sub.getQuery() + ')', 'x')
      .setParameters(sub.getParameters())
      .innerJoin(User, 'u', 'u.id = x.user_id')
      .select([
        'x.room_id AS room_id',
        'x.total   AS total',
        'u.*', // User 전체 컬럼
      ])
      .where('x.rn <= :limitPerRoom', { limitPerRoom })
      .orderBy('x.room_id', 'ASC')
      .addOrderBy('x.rn', 'ASC')
      .getRawMany<{ room_id: string; total: string } & User>();

    const userRepo = this.manager.getRepository(User);
    rows.forEach((r) => {
      const entry = map.get(r.room_id) ?? { users: [], total: Number(r.total) };

      entry.users.push(userRepo.create(r));
      map.set(r.room_id, entry);
    });

    roomIds.forEach((id) => {
      if (!map.has(id)) map.set(id, { users: [], total: 0 });
    });

    return map;
  }
}
