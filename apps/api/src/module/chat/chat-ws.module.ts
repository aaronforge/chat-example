import { Module } from '@nestjs/common';
import { ChatWsGateway } from './chat-room-ws.gateway';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [ConfigModule, AuthModule, RoomModule],
  providers: [ChatWsGateway],
})
export class ChatWsModule {}
