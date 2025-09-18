import { IsIn, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessagePayloadDto {
  @IsUUID() readonly roomId: string;
  @IsIn(['text']) readonly type: 'text';
  @IsString() @MaxLength(4000) readonly content: string;
  @IsUUID() readonly clientMsgId: string;
}
