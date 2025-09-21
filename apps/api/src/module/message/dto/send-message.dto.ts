import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, MaxLength } from 'class-validator';
import { Trim } from '@api/common/decorator/trim.decorator';

export class SendMessageDto {
  @ApiProperty({
    type: String,
  })
  @IsUUID()
  readonly roomId: string;

  @ApiProperty({
    type: String,
    enum: ['text'],
    example: 'text',
  })
  @IsIn(['text'])
  readonly type: 'text';

  @ApiProperty({
    type: String,
    description: 'Trim 처리 됩니다.',
    maxLength: 4000,
  })
  @IsString()
  @MaxLength(4000)
  @Trim()
  readonly content: string;

  @ApiProperty({
    type: String,
    description: '클라이언트에서 생성한 메시지 ID(멱등성 보장) — UUID v4',
  })
  @IsUUID()
  readonly clientMsgId: string;
}
