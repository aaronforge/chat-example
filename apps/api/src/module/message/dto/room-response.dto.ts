import { ApiProperty } from '@nestjs/swagger';
import { Room } from 'src/entity/room.entity';
import { MessageResponseDto } from './message-response.dto';

export class RoomResponseDto {
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
    type: MessageResponseDto,
    nullable: true,
  })
  lastMessage: MessageResponseDto | null;

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

  static fromEntity(entity: Room): RoomResponseDto {
    return {
      id: entity.id,
      title: entity.title || null,
      lastMessage: entity.lastMessage
        ? MessageResponseDto.fromEntity(entity.lastMessage)
        : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class RoomListResponseDto {
  @ApiProperty({ type: RoomResponseDto, isArray: true })
  list: RoomResponseDto[];

  @ApiProperty({ type: Number, description: '총 개수' })
  total: number;
}
