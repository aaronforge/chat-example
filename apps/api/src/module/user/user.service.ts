import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repository/user.repository';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from 'src/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { EmailExistsException } from 'src/common/exception/user.exception';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const email = dto.email.trim().toLowerCase();

    // 이메일 중복체크
    if (await this.userRepository.existsByEmail(email)) {
      // TODO: 이메일 중복 에러 처리
      throw new EmailExistsException();
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      email,
      passwordHash,
      nickname: dto.nickname.trim(),
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
