import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CurrentUserId } from '@api/common/decorator/current-user.decorator';
import {
  MessageListResponseDto,
  MessageResponseDto,
} from './dto/message-response.dto';
import { ExceptionResponseDto } from '@api/common/exception/base.exception';
import { ListMessageQuery } from './dto/list-message.dto';

@ApiBearerAuth()
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: '메시지 목록 조회' })
  @ApiOkResponse({ type: MessageListResponseDto })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'NOT_IN_ROOM',
  })
  @Get()
  async list(
    @CurrentUserId() userId: string,
    @Query() q: ListMessageQuery,
  ): Promise<MessageListResponseDto> {
    const { list, total, nextCursor } = await this.messageService.list(
      userId,
      q,
    );
    const messages = list.map(MessageResponseDto.fromEntity);
    return { list: messages, total, nextCursor };
  }
}
