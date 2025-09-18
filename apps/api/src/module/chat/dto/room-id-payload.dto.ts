import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RoomIdPayloadDto {
  @ApiProperty() @IsUUID() readonly roomId: string;
}
