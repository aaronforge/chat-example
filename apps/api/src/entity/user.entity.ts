import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';
import { RoomMember } from './room-member.entity';

@Entity({ name: 'user' })
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  nickname: string;

  members?: RoomMember[];
}
