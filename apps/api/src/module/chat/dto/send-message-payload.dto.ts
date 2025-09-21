import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsUUID, MaxLength } from 'class-validator';
import { Trim } from '@api/common/decorator/trim.decorator';

export class SendMessagePayloadDto {
  @ApiProperty() @IsUUID() readonly roomId: string;
  @ApiProperty() @IsIn(['text']) readonly type: 'text';
  @ApiProperty() @IsString() @MaxLength(4000) @Trim() readonly content: string;
  @ApiProperty() @IsUUID() readonly clientMsgId: string;
}
