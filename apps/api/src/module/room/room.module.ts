import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomMember } from '@api/entity/room-member.entity';
import { Room } from '@api/entity/room.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomRepository } from '@api/repository/room.repository';
import { RoomMemberRepository } from '@api/repository/room-member.repository';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomMember]), MessageModule],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository, RoomMemberRepository],
  exports: [RoomService, RoomRepository, RoomMemberRepository],
})
export class RoomModule {}
