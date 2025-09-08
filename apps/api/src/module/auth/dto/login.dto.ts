import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Trim } from 'src/common/decorator/trim.decorator';

export class LoginDto {
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
  })
  @IsString()
  password: string;
}
