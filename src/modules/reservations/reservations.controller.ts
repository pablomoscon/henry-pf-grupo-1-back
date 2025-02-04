import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationResponseDto } from './dto/response-reservation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RolesGuard } from 'src/guards/roles/roles.guard';

@Controller('reservations')
@ApiTags('Reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    const reservation =
      await this.reservationsService.create(createReservationDto);

    return new ReservationResponseDto(reservation);
  };

  @Post(':reservationId/add-caretaker/:userId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async addCaretakerToReservation(
    @Param('reservationId') reservationId: string,
    @Param('userId') userId: string,
  ) {
    return this.reservationsService.addCaretakerToReservation(reservationId, userId);
  };

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.reservationsService.findAll();
  };

  @Get('unavailable-rooms')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  unavailableRoomsDates(@Query('roomId') roomId: string) {
    return this.reservationsService.unavailableRoomsDates(roomId);
  };

  @Get('users-reservations')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async usersReservations(@Query('userId') userId: string) {
    return await this.reservationsService.findUserReservations(userId);
  };

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.reservationsService.findOne(id);
  };

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return await this.reservationsService.update(id, updateReservationDto);
  };

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.reservationsService.remove(id);
  };
}
