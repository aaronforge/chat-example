import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/user.entity';

export class UserResponseDTO {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  email: string;

  @ApiProperty({
    type: String,
  })
  nickname: string;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;

  static fromEntity(entity: User): UserResponseDTO {
    return {
      id: entity.id,
      email: entity.email,
      nickname: entity.nickname,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
