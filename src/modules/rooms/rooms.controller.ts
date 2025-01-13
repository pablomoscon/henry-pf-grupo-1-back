import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  BadRequestException,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiTags } from '@nestjs/swagger';
import { Room } from './entities/room.entity';


@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomsService.create(createRoomDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (isNaN(pageNumber) || pageNumber <= 0) {
      throw new BadRequestException('Invalid page number');
    }

    if (isNaN(limitNumber) || limitNumber <= 0) {
      throw new BadRequestException('Invalid limit number');
    }
    return await this.roomsService.findAll(pageNumber, limitNumber);
  }

  @Get('available')
  @HttpCode(HttpStatus.OK)
  async findAvailableRooms(
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string,
    @Query('numberOfCats') numberOfCats?: number,
  ): Promise<Room[]> {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new BadRequestException('Invalid check-in or check-out date');
    }

    return await this.roomsService.findAvailableRooms(checkIn, checkOut, numberOfCats);
  };

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const room = await this.roomsService.findOne(id);
    if (!room || room.deleted_at) {
      throw new NotFoundException(`Room with ID ${id} not found or has been deleted`);
    }
    return room;
  };

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return await this.roomsService.update(id, updateRoomDto);
  };

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.roomsService.remove(id);
  };

}
