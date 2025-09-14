import { ApiProperty } from '@nestjs/swagger';

export class IdListResponseDto {
  @ApiProperty({ type: String, isArray: true })
  ids: string[];
}
