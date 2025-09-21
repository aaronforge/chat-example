import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@api/entity/refresh-token.entity';
import { DataSource, IsNull, Repository } from 'typeorm';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(dataSource: DataSource) {
    super(RefreshToken, dataSource.createEntityManager());
  }

  /**
   * 유효한 리프레시 토큰 조회
   */
  async findValidByUserAndJti(
    userId: string,
    jti: string,
  ): Promise<RefreshToken | null> {
    return this.findOne({
      where: {
        userId,
        jti,
        revokedAt: IsNull(),
      },
    });
  }

  /**
   * 리프레시 토큰 폐기 (단일)
   */
  async revokeById(id: string) {
    const now = new Date();

    return this.update(
      {
        id,
        revokedAt: IsNull(),
      },
      {
        revokedAt: now,
      },
    );
  }

  /**
   * 리프레시 토큰 폐기 (특정 사용자 전체)
   */
  async revokeAllByUser(userId: string) {
    const now = new Date();

    return this.update(
      {
        userId,
        revokedAt: IsNull(),
      },
      {
        revokedAt: now,
      },
    );
  }
}
