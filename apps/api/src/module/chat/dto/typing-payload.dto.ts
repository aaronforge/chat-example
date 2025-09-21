import { ApiProperty } from '@nestjs/swagger';

export class TypingPayloadDto {
  @ApiProperty() roomId: string;
  @ApiProperty() userId: string;
  @ApiProperty() isTyping: boolean;

  constructor(partial: Partial<TypingPayloadDto>) {
    Object.assign(this, partial);
  }
}
