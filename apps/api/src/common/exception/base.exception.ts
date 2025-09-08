import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class BaseException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
  ) {
    super({ code, message }, status);
  }
}

export class ExceptionResponseDto {
  @ApiProperty({
    type: Number,
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    type: String,
    example: 'BAD_REQUEST',
  })
  code: string;

  @ApiProperty({
    type: String,
    example: '잘못된 요청입니다.',
  })
  message: string;

  @ApiProperty({
    type: Date,
  })
  timestamp: Date;

  @ApiProperty({
    type: String,
    example: '/user',
  })
  path: string;
}
