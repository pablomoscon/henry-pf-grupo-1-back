import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import {
  Between,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUploadService } from 'src/modules/file-upload/file-upload.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    private readonly fileUploadService: FileUploadService,
  ) { }

  async create(
    createRoomDto: CreateRoomDto,
    file: Express.Multer.File,
  ): Promise<Room> {
    let imgUrl: string | undefined;

    if (file) {
      const uploadedFile = await this.fileUploadService.uploadFile({
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
      imgUrl = uploadedFile;
    }

    const newRoom = this.roomsRepository.create({
      ...createRoomDto,
      img: imgUrl,
    });
    return this.roomsRepository.save(newRoom);
  };

  async findAll(pageNumber: number, limitNumber: number) {
    return await this.roomsRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['reservations'],
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    });
  };

  async findRooms(
    filters: {
      checkInDate?: Date;
      checkOutDate?: Date;
      numberOfCats?: number;
      priceRange?: { minPrice?: number; maxPrice?: number };
    } = {},
  ): Promise<Room[]> {
    const { checkInDate, checkOutDate, numberOfCats, priceRange } = filters;

    const minPrice =
      priceRange?.minPrice && !isNaN(priceRange.minPrice)
        ? priceRange.minPrice
        : undefined;
    const maxPrice =
      priceRange?.maxPrice && !isNaN(priceRange.maxPrice)
        ? priceRange.maxPrice
        : undefined;

    const rooms = await this.roomsRepository.find({
      relations: ['reservations'],
      where: {
        deleted_at: IsNull(),
        ...(numberOfCats !== undefined && { number_of_cats: numberOfCats }),
        ...(minPrice !== undefined && { price: MoreThanOrEqual(minPrice) }),
        ...(maxPrice !== undefined && { price: LessThanOrEqual(maxPrice) }),
        ...(minPrice !== undefined &&
          maxPrice !== undefined && { price: Between(minPrice, maxPrice) }),
      },
    });

    if (checkInDate && checkOutDate) {
      return rooms.filter((room) =>
        room.reservations.every(
          ({ checkInDate, checkOutDate }) =>
            new Date(checkOutDate) < checkInDate ||
            new Date(checkInDate) > checkOutDate,
        ),
      );
    }

    return rooms;
  };

  async findOne(id: string) {
    return await this.roomsRepository.findOneBy({ id });
  };

  async update(id: string, updateRoomDto: UpdateRoomDto, file?: Express.Multer.File): Promise<Room> {
    let imgUrl: string | undefined;

    if (file) {
      imgUrl = await this.fileUploadService.uploadFile({
        fieldName: file.fieldname,
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    const updateRoom = await this.roomsRepository.preload({
      id,
      ...updateRoomDto,
      img: imgUrl || undefined,
    });

    if (!updateRoom) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    await this.roomsRepository.save(updateRoom);

    return updateRoom;
  };

  async remove(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({ where: { id } });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    room.deleted_at = new Date();
    return this.roomsRepository.save(room);
  };

  async updateAvailability() {
    const rooms = await this.roomsRepository.find({
      relations: ['reservations'],
      where: { deleted_at: IsNull() },
    });

    const now = new Date();
    const updatedRooms = [];

    for (const room of rooms) {
      const isOccupied = room.reservations.some(reservation =>
        new Date(reservation.checkInDate) <= now &&
        new Date(reservation.checkOutDate) >= now
      );

      if (room.available !== !isOccupied) {
        room.available = !isOccupied;
        updatedRooms.push(room);
      }
    }

    if (updatedRooms.length > 0) {
      await this.roomsRepository.save(updatedRooms);
      console.log(`${updatedRooms.length} Rooms updated.`);
    }
  };
}