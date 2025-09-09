import { Injectable } from '@nestjs/common';
import { User } from 'src/entity/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  /**
   * 이메일로 사용자 존재 여부 확인
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }
}
