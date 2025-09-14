import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity({ name: 'room_member' })
@Index('idx_primary', ['roomId', 'userId'], { unique: true })
@Index('idx_room_id_created_at', ['roomId', 'createdAt'])
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
