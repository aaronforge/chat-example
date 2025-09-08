import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Trim } from 'src/common/decorator/trim.decorator';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    example: 'me@me.me',
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
    example: 'Me',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  @Trim()
  nickname: string;
}
