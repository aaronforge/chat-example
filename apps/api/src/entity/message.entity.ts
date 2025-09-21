import { Entity, PrimaryGeneratedColumn, Column, Unique, Index } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity({ name: 'message' })
@Unique(['roomId', 'seq'])
@Unique(['roomId', 'clientMsgId'])
export class Message extends BaseTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  roomId: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  clientMsgId: string;

  @Index('idx_message_room_seq')
  @Column('int')
  seq: number;

  @Column({ type: 'varchar', default: 'text' })
  type: 'text' | 'image' | 'system';

  @Column({ type: 'varchar', nullable: true })
  content?: string;

  room?: Room;

  user?: User;
}
