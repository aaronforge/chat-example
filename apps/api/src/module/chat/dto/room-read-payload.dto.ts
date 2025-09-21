import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class RoomReadPayloadDto {
  @ApiProperty() @IsUUID() readonly roomId: string;
  @ApiProperty() @IsInt() @Min(0) readonly upToSeq: number;
}
