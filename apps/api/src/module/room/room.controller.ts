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
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async list(@CurrentUserId() userId: string) {
    const rooms = await this.roomService.listMyRooms(userId);
    return { rooms };
  }

  @Delete(':id/leave')
  async leave(
    @CurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) roomId: string,
  ): Promise<OkResponseDto> {
    await this.roomService.leaveRoom(userId, roomId);
    return { ok: true };
  }
}
