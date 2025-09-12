import { ApiProperty } from '@nestjs/swagger';
import { Message } from 'src/entity/message.entity';
import { UserResponseDto } from 'src/module/user/dto/user-response.dto';

export class MessageResponseDto {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  roomId: string;

  @ApiProperty({
    type: String,
  })
  userId: string;

  @ApiProperty({
    type: String,
  })
  clientMsgId: string;

  @ApiProperty({
    type: Number,
  })
  seq: number;

  @ApiProperty({
    type: String,
    enum: ['text', 'image', 'system'],
  })
  type: 'text' | 'image' | 'system';

  @ApiProperty({
    type: String,
    nullable: true,
  })
  content: string | null;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
  })
  deletedAt: Date | null;

  static fromEntity(entity: Message): MessageResponseDto {
    return {
      id: entity.id,
      roomId: entity.roomId,
      userId: entity.userId,
      clientMsgId: entity.clientMsgId,
      seq: entity.seq,
      type: entity.type,
      content: entity.deletedAt ? null : entity.content || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt || null,
    };
  }
}

export class MessageListResponseDto {
  @ApiProperty({
    type: MessageResponseDto,
    isArray: true,
  })
  list: MessageResponseDto[];

  @ApiProperty({
    type: Number,
  })
  total: number;
}
