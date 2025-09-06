import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

/**
 * 모든 엔티티에서 공통으로 쓰는 타임스탬프 & 소프트삭제 컬럼
 * - createdAt / updatedAt 은 자동 세팅
 * - deletedAt 이 null이 아니면 소프트 삭제된 것으로 간주
 */
export abstract class BaseTimeEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}
