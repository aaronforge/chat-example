import { IsUUID } from 'class-validator';

export class MessageIdPayloadDto {
  @IsUUID() readonly messageId: string;
}
