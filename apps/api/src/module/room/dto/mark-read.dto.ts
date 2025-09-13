import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class MarkReadDto {
  @ApiProperty({
    type: Number,
    description: '이 seq 까지 읽음 처리(inclusive)',
  })
  @IsInt()
  @Min(0)
  readonly upToSeq: number;
}
