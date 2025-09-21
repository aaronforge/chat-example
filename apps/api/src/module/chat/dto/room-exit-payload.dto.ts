import { ApiProperty } from '@nestjs/swagger';

export class RoomExitPayloadDto {
  @ApiProperty() roomId: string;

  @ApiProperty() userId: string;

  constructor(partial: Partial<RoomExitPayloadDto>) {
    Object.assign(this, partial);
  }
}
