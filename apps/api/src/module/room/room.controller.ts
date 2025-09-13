import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoomService } from './room.service';
import { OkResponseDto } from 'src/common/dto/ok-response.dto';
import {
  ApiBadRequestResponse,
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
import { ListRoomQueryDto } from './dto/list-room.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({ summary: '방 생성' })
  @ApiOkResponse({ type: RoomResponseDto })
  @ApiBadRequestResponse({
    description: 'NEED_AT_LEAST_TWO_MEMBERS',
    type: ExceptionResponseDto,
  })
  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    const room = await this.roomService.createRoom(userId, body);
    return RoomResponseDto.fromEntity(room);
  }

  @ApiOperation({ summary: '내가 속한 방 목록 조회' })
  @ApiOkResponse({ type: RoomListResponseDto })
  @Get()
  async list(
    @CurrentUserId() userId: string,
    @Query() query: ListRoomQueryDto,
  ): Promise<RoomListResponseDto> {
    const { list, total } = await this.roomService.listMyRooms(userId, query);
    const rooms = list.map(RoomResponseDto.fromEntity);
    return { list: rooms, total };
  }

  @ApiOperation({ summary: '멤버 목록' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'NOT_IN_ROOM',
  })
  @Get(':id/members')
  async members(
    @CurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) roomId: string,
  ): Promise<UserResponseDto[]> {
    const members = await this.roomService.listMembers(userId, roomId);
    return members
      .filter((m) => !!m.user)
      .map((m) => UserResponseDto.fromEntity(m.user!));
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
