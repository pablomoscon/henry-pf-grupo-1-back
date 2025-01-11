import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { Repository } from 'typeorm';
import { roomsMock } from './rooms-mock';

@Injectable()
export class RoomsSeed {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  async seed() {
    const existingRooms = (await this.roomRepository.find()).map(
      (room) => room.id,
    );
    for (const roomData of roomsMock) {
      if (!existingRooms.includes(roomData.id)) {
        const room = new Room();
        room.id = roomData.id;
        room.name = roomData.name;
        room.imgs = roomData.imgs;
        room.description = roomData.description;
        room.price = roomData.price;
        room.available = roomData.available;
        room.deleted_at = roomData.deleted_at;
        room.number_of_cats = roomData.number_of_cats;
        room.features = roomData.features;
        room.reservations = roomData.reservations;
        await this.roomRepository.save(room);
      }
    }
  }
}
