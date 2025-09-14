import { ApiProperty } from '@nestjs/swagger';
import { Room } from 'src/entity/room.entity';

export class RoomSummaryResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: '방 제목',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: '방 생성일',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: '방 수정일',
  })
  updatedAt: Date;

  static fromEntity(entity: Room): RoomSummaryResponseDto {
    return {
      id: entity.id,
      title: entity.title || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
