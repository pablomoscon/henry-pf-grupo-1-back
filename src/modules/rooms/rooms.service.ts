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
  ) {}

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
  }

  async findAll(pageNumber: number, limitNumber: number) {
    return await this.roomsRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['reservations'],
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    });
  }

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
          ({ initial_date, ending_date }) =>
            new Date(ending_date) < checkInDate ||
            new Date(initial_date) > checkOutDate,
        ),
      );
    }

    return rooms;
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
  }

  async remove(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({ where: { id } });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    room.deleted_at = new Date();
    return this.roomsRepository.save(room);
  }
}
