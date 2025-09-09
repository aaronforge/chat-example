import { Entity, PrimaryColumn, Column } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity({ name: 'room_member' })
export class RoomMember extends BaseTimeEntity {
  @PrimaryColumn('uuid')
  roomId: string;

  @PrimaryColumn('uuid')
  userId: string;

  @Column({ type: 'varchar', default: 'member' })
  role: 'member' | 'admin';

  @Column({ type: 'int', default: 0 })
  lastReadSeq: number;

  room?: Room;

  user?: User;
}
