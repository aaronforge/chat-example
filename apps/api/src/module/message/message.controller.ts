import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CurrentUserId } from 'src/common/decorator/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import {
  MessageListResponseDto,
  MessageResponseDto,
} from './dto/message-response.dto';
import { ExceptionResponseDto } from 'src/common/exception/base.exception';
import { ListMessageQuery } from './dto/list-message.dto';
import { OkResponseDto } from 'src/common/dto/ok-response.dto';

@ApiBearerAuth()
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: '메시지 전송' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiNotFoundResponse({ description: 'NOT_IN_ROOM | ROOM_NOT_FOUND' })
  @Post()
  async send(
    @CurrentUserId() userId: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messageService.send(userId, dto);
    return MessageResponseDto.fromEntity(message);
  }

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
    const { list, total } = await this.messageService.list(userId, q);
    const messages = list.map(MessageResponseDto.fromEntity);
    return { list: messages, total };
  }

  @ApiOperation({ summary: '메시지 삭제' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: OkResponseDto })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'MESSAGE_NOT_FOUND',
  })
  @ApiForbiddenResponse({
    type: ExceptionResponseDto,
    description: 'FORBIDDEN',
  })
  @Delete(':id')
  async remove(
    @CurrentUserId() userId: string,
    @Param('id') messageId: string,
  ): Promise<OkResponseDto> {
    const ok = await this.messageService.remove(userId, messageId);
    return { ok };
  }
}
