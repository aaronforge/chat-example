import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageResponseDto } from '@api/module/message/dto/message-response.dto';
import { UserResponseDto } from '@api/module/user/dto/user-response.dto';

export class RoomDetailResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  title: string | null;

  @ApiProperty({ type: MessageResponseDto, nullable: true })
  lastMessage: MessageResponseDto | null;

  @ApiProperty({ type: UserResponseDto, isArray: true })
  members: UserResponseDto[];

  @ApiProperty({ type: Number })
  numOfMembers: number;

  @ApiPropertyOptional({ type: Number })
  numOfUnreadMessages?: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
