import { ApiProperty } from '@nestjs/swagger';

export class RoomExitResponseDto {
  @ApiProperty() roomId: string;

  @ApiProperty() userId: string;
}
