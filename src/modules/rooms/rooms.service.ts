import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) { }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const newRoom = await this.roomsRepository.create(createRoomDto);
    return this.roomsRepository.save(newRoom);
  }

  async findAll(pageNumber: number, limitNumber: number) {
    return await this.roomsRepository.find({
      where: { deleted_at: null },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    });
  }

  async findOne(id: string) {
    return await this.roomsRepository.findOneBy({ id });
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const updateResult = await this.roomsRepository.update(id, updateRoomDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return await this.findOne(id);
  };

  async remove(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({ where: { id } });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    room.deleted_at = new Date();

    return this.roomsRepository.save(room);
  }
}
