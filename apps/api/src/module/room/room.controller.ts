import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoomService } from './room.service';
import { OkResponseDto } from 'src/common/dto/ok-response.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import {
  RoomListResponseDto,
  RoomResponseDto,
} from '../message/dto/room-response.dto';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({ summary: '내가 속한 방 목록 조회' })
  @ApiOkResponse({ type: RoomListResponseDto })
  @Get()
  async list(@CurrentUserId() userId: string): Promise<RoomListResponseDto> {
    const { list, total } = await this.roomService.listMyRooms(userId);
    const rooms = list.map(RoomResponseDto.fromEntity);
    return { list: rooms, total };
  }

  @ApiOperation({ summary: '방 나가기' })
  @ApiOkResponse({ type: OkResponseDto })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'NOT_IN_ROOM',
  })
  @Delete(':id/leave')
  async leave(
    @CurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) roomId: string,
  ): Promise<OkResponseDto> {
    await this.roomService.leaveRoom(userId, roomId);
    return { ok: true };
  }
}
