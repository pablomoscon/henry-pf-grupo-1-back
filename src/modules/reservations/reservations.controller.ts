import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationResponseDto } from './dto/response-reservation.dto';
import { UnavailableRoomsDto } from './dto/unavailable-rooms-dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('reservations')
@ApiTags('Reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
    const reservation = await this.reservationsService.create(createReservationDto);
    return new ReservationResponseDto(reservation);
  };

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.reservationsService.findAll();
  };


  @Get('unavailable-rooms')
  @HttpCode(HttpStatus.OK)
  unavailableRooms(@Body() body: UnavailableRoomsDto) {
    const { roomId, checkInDate, checkOutDate } = body;

    return this.reservationsService.unavailableRooms(
      roomId,
      new Date(checkInDate),
      new Date(checkOutDate)
    );
  };

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.reservationsService.findOne(id);
  };

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return await this.reservationsService.update(id, updateReservationDto);
  };

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.reservationsService.remove(id);
  };
}