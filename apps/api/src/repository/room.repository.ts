import { Injectable } from '@nestjs/common';
import { Room } from 'src/entity/room.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RoomRepository extends Repository<Room> {
  constructor(private dataSource: DataSource) {
    super(Room, dataSource.createEntityManager());
  }
}
