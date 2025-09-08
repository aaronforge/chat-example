import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';
import { RoomMember } from './room-member.entity';

@Entity('user')
export class User extends BaseTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  nickname: string;

  members?: RoomMember[];
}
