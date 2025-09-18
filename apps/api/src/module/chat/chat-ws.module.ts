import { Module } from '@nestjs/common';
import { ChatWsGateway } from './chat-ws.gateway';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ChatWsService } from './chat-ws.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [ConfigModule, AuthModule, RoomModule],
  providers: [ChatWsGateway, ChatWsService],
})
export class ChatWsModule {}
