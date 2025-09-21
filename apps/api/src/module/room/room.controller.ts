import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoomService } from './room.service';
import { OkResponseDto } from '@api/common/dto/ok-response.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CurrentUserId } from '@api/common/decorator/current-user.decorator';
import { RoomSummaryResponseDto } from './dto/room-summary-response.dto';
import { ExceptionResponseDto } from '@api/common/exception/base.exception';
import { ListRoomQueryDto } from './dto/list-room.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { RoomListResponseDto } from './dto/room-list-response.dto';
import { MessageResponseDto } from '../message/dto/message-response.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { IdListResponseDto } from '@api/common/dto/id-list-response.dto';
import { RoomDetailResponseDto } from './dto/room-detail-response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({ summary: '방 생성' })
  @ApiOkResponse({ type: RoomSummaryResponseDto })
  @ApiBadRequestResponse({
    description: 'NEED_AT_LEAST_TWO_MEMBERS',
    type: ExceptionResponseDto,
  })
  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateRoomDto,
  ): Promise<RoomSummaryResponseDto> {
    const room = await this.roomService.createRoom(userId, dto);
    return RoomSummaryResponseDto.fromEntity(room);
  }

  @ApiOperation({ summary: '내가 속한 방 목록 조회' })
  @ApiOkResponse({ type: RoomListResponseDto })
  @Get()
  async list(
    @CurrentUserId() userId: string,
    @Query() query: ListRoomQueryDto,
  ): Promise<RoomListResponseDto> {
    const { list, total } = await this.roomService.listMyRooms(userId, query);
    const detailedList = list.map<RoomDetailResponseDto>((data) => ({
      id: data.room.id,
      title: data.room.title || null,
      lastMessage: data.room.lastMessage
        ? MessageResponseDto.fromEntity(data.room.lastMessage)
        : null,
      members: data.members.map(UserResponseDto.fromEntity),
      numOfMembers: data.numOfMembers,
      numOfUnreadMessages: data.numOfUnreadMessages,
      createdAt: data.room.createdAt,
      updatedAt: data.room.updatedAt,
    }));

    return {
      list: detailedList,
      total,
    };
  }

  @ApiOperation({ summary: '초대' })
  @ApiOkResponse({ type: IdListResponseDto })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'ROOM_NOT_FOUND | NOT_IN_ROOM',
  })
  @Post(':id/invite')
  async invite(
    @CurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) roomId: string,
    @Body() dto: InviteMemberDto,
  ): Promise<IdListResponseDto> {
    const { ids } = await this.roomService.inviteMember(userId, roomId, dto);
    return { ids };
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
