import { Injectable } from '@nestjs/common';
import { RoomMemberRepository } from 'src/repository/room-member.repository';

@Injectable()
export class ChatWsService {
  constructor(private readonly roomMemberRepository: RoomMemberRepository) {}

  async ensureUserInRoom(userId: string, roomId: string) {
    // TODO: 조회
  }
}
