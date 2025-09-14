import { ApiProperty } from '@nestjs/swagger';
import { RoomDetailResponseDto } from './room-detail-response.dto';

export class RoomListResponseDto {
  @ApiProperty({ type: RoomDetailResponseDto, isArray: true })
  list: RoomDetailResponseDto[];

  @ApiProperty({ type: Number })
  total: number;
}
