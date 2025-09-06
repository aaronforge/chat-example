import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';

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

  @Column('int')
  seq: number;

  @Column({ type: 'text', default: 'text' })
  type: 'text' | 'image' | 'system';

  @Column({ type: 'text', nullable: true })
  content?: string;
}
