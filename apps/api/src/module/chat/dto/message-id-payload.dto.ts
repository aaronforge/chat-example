import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MessageIdPayloadDto {
  @ApiProperty() @IsUUID() readonly messageId: string;
}
