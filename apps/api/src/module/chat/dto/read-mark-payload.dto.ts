import { IsInt, IsUUID, Min } from 'class-validator';

export class ReadMarkPayloadDto {
  @IsUUID() readonly roomId: string;
  @IsInt() @Min(0) readonly upToSeq: number;
}
