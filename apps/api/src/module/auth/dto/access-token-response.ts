import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDTO {
  @ApiProperty({
    type: String,
  })
  accessToken: string;
}
