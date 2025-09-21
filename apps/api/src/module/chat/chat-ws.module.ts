import { Module } from '@nestjs/common';
import { ChatWsGateway } from './chat-ws.gateway';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { RoomModule } from '../room/room.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [ConfigModule, AuthModule, MessageModule, RoomModule],
  providers: [ChatWsGateway],
})
export class ChatWsModule {}
