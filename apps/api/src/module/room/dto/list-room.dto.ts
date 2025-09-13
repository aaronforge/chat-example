import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListRoomQueryDto {
  @ApiPropertyOptional({ type: Number, default: 0, example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly offset?: number = 0;

  @ApiPropertyOptional({
    type: Number,
    default: 20,
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 20;
}
