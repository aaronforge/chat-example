import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/entity/message.entity';
import { RoomMember } from 'src/entity/room-member.entity';
import { Room } from 'src/entity/room.entity';
import { MessageRepository } from 'src/repository/message.repository';
import { RoomMemberRepository } from 'src/repository/room-member.repository';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Room, RoomMember])],
  controllers: [MessageController],
  providers: [RoomMemberRepository, MessageRepository, MessageService],
  exports: [RoomMemberRepository, MessageRepository],
})
export class MessageModule {}
