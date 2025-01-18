import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationResponseDto } from './dto/response-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Post()
  async create(@Body() createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
    const reservation = await this.reservationsService.create(createReservationDto);
    return new ReservationResponseDto(reservation);
  };

  @Get()
  async findAll() {
    return await this.reservationsService.findAll();
  };

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.reservationsService.findOne(id);
  };

  @Get('unavailable-rooms')
  async unavailableRooms(roomId: string, checkInDate: Date, checkOutDate: Date) {
    return await this.unavailableRooms(roomId, checkInDate, checkOutDate)
  };

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return await this.reservationsService.update(id, updateReservationDto);
  };

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.reservationsService.remove(id);
  };
}