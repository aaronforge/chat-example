import { ApiProperty } from '@nestjs/swagger';

export class OkResponseDto {
  @ApiProperty({
    type: Boolean,
  })
  ok: boolean;
}
