import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';

@Entity({ name: 'refresh_token' })
export class RefreshToken extends BaseTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar' })
  tokenHash: string;

  @Column({ type: 'varchar' })
  @Index()
  jti: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent?: string | null;

  @Column({ type: 'varchar', nullable: true })
  ip?: string | null;

  @Column({ type: 'timestamptz' })
  expiredAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt?: Date | null;
}
