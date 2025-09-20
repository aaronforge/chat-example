import { IsIn, IsString, IsUUID, MaxLength } from 'class-validator';
import { Trim } from 'src/common/decorator/trim.decorator';

export class SendMessagePayloadDto {
  @IsUUID() readonly roomId: string;
  @IsIn(['text']) readonly type: 'text';
  @IsString() @MaxLength(4000) @Trim() readonly content: string;
  @IsUUID() readonly clientMsgId: string;
}
