import { ApiProperty } from '@nestjs/swagger';

export class MessageDeletePayloadDto {
  @ApiProperty() roomId: string;
  @ApiProperty() messageId: string;

  constructor(partial: Partial<MessageDeletePayloadDto>) {
    Object.assign(this, partial);
  }
}
