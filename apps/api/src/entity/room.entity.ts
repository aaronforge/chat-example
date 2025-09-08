import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';
import { RoomMember } from './room-member.entity';
import { Message } from './message.entity';

@Entity({ name: 'room' })
export class Room extends BaseTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  type: 'dm' | 'group';

  @Column({ type: 'text', nullable: true })
  title?: string;

  @Column({ type: 'int', default: 0 })
  lastSeq: number;

  member?: RoomMember[];

  lastMessage?: Message;
}
