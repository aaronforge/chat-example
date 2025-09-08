import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDto {
  @ApiProperty({
    type: String,
  })
  accessToken: string;
}
