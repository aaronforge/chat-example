import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Trim } from 'src/common/decorator/trim.decorator';

export class CreateUserDTO {
  @ApiProperty({
    type: String,
    example: 'chat@chat.chat',
  })
  @IsEmail()
  @Trim()
  email: string;

  @ApiProperty({
    type: String,
    example: 'password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    type: String,
    example: 'nickname',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  @Trim()
  nickname: string;
}
