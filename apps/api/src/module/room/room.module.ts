import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomMember } from 'src/entity/room-member.entity';
import { Room } from 'src/entity/room.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomRepository } from 'src/repository/room.repository';
import { RoomMemberRepository } from 'src/repository/room-member.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomMember])],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository, RoomMemberRepository],
  exports: [RoomService],
})
export class RoomModule {}
