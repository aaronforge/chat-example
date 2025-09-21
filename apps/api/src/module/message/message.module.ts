import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '@api/entity/message.entity';
import { RoomMember } from '@api/entity/room-member.entity';
import { Room } from '@api/entity/room.entity';
import { MessageRepository } from '@api/repository/message.repository';
import { RoomMemberRepository } from '@api/repository/room-member.repository';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Room, RoomMember])],
  controllers: [MessageController],
  providers: [RoomMemberRepository, MessageRepository, MessageService],
  exports: [RoomMemberRepository, MessageRepository],
})
export class MessageModule {}
