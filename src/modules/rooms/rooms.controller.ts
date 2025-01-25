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
  HttpCode,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Room } from './entities/room.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { ImageUploadValidationPipe } from 'src/pipes/image-upload-validation.pipe';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('img'))
  async create(
    @UploadedFile(new ImageUploadValidationPipe()) file: Express.Multer.File,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    if (typeof createRoomDto.features === 'string') {
      try {
        createRoomDto.features = JSON.parse(createRoomDto.features);
      } catch (error) {
        throw new BadRequestException('Invalid format for features');
      }
    }
    return await this.roomsService.create(createRoomDto, file);
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

  @Get('filters')
  @HttpCode(HttpStatus.OK)
  async findRooms(
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string,
    @Query('numberOfCats') numberOfCats?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<Room[]> {
    const checkIn = checkInDate ? new Date(checkInDate) : undefined;
    const checkOut = checkOutDate ? new Date(checkOutDate) : undefined;

    if (
      (checkInDate && isNaN(checkIn.getTime())) ||
      (checkOutDate && isNaN(checkOut.getTime()))
    ) {
      throw new BadRequestException('Invalid check-in or check-out date');
    }

    const numberOfCatsNumber = numberOfCats ? Number(numberOfCats) : undefined;
    const minPriceNumber = minPrice ? Number(minPrice) : undefined;
    const maxPriceNumber = maxPrice ? Number(maxPrice) : undefined;

    if (
      (numberOfCats && isNaN(numberOfCatsNumber)) ||
      (minPrice && isNaN(minPriceNumber)) ||
      (maxPrice && isNaN(maxPriceNumber))
    ) {
      throw new BadRequestException('Invalid number for one or more filters');
    }

    const filters = {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfCats: numberOfCatsNumber,
      priceRange:
        minPrice || maxPrice
          ? { minPrice: minPriceNumber, maxPrice: maxPriceNumber }
          : undefined,
    };

    return await this.roomsService.findRooms(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const room = await this.roomsService.findOne(id);
    if (!room || room.deleted_at) {
      throw new NotFoundException(
        `Room with ID ${id} not found or has been deleted`,
      );
    }
    return room;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return await this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.roomsService.remove(id);
  }
}
