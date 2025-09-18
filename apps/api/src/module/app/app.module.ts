import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/entity/user.entity';
import { Message } from 'src/entity/message.entity';
import { RoomMember } from 'src/entity/room-member.entity';
import { Room } from 'src/entity/room.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { RoomModule } from '../room/room.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { MessageModule } from '../message/message.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ChatWsModule } from '../chat/chat-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('POSTGRES_HOST'),
        port: +configService.getOrThrow<number>('POSTGRES_PORT'),
        username: configService.getOrThrow<string>('POSTGRES_USER'),
        password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: configService.getOrThrow<string>('POSTGRES_DB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    TypeOrmModule.forFeature([User, Message, RoomMember, Room]),
    AuthModule,
    UserModule,
    RoomModule,
    MessageModule,
    ChatWsModule,
  ],
  controllers: [AppController],
  providers: [
    Reflector,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    AppService,
  ],
})
export class AppModule {}
