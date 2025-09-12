import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListMessageQuery {
  @ApiProperty({
    type: String,
  })
  @IsUUID()
  readonly roomId: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly beforeSeq?: number;

  @ApiPropertyOptional({
    type: Number,
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number;
}
