import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { CreateReservationDto } from 'src/modules/reservations/dto/create-reservation.dto';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';
import { CatsService } from '../cats/cats.service';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { Cat } from '../cats/entities/cat.entity';
import { ReservationResponseDto } from './dto/response-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly catsService: CatsService,
  ) { }

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { userId, roomId, catsIds, checkInDate, checkOutDate } = createReservationDto;

    const isUsersCat = await Promise.all(catsIds.map(cat => this.catsService.isCatOwnedByUser(cat, userId)));
    if (isUsersCat.some(isOwned => isOwned === false)) {
      throw new BadRequestException('One or more cats are not owned by the user');
    };

    const isRoomAvailable = await this.isRoomAvailable(roomId, checkInDate, checkOutDate);

    if (!isRoomAvailable) {
      throw new BadRequestException("The room is not available for the selected dates");
    };

    const user = await this.usersService.findOne(userId)
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const room = await this.roomsService.findOne(roomId)
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const cats: Cat[] = [];

    for (const catId of catsIds) {
      const cat = await this.catsService.findOne(catId);
      if (!cat) {
        throw new NotFoundException(`Cat with ID ${catId} not found`);
      } else {
        cats.push(cat);
      }
    };

    const reservation: Reservation = await this.reservationRepository.create({
      user,
      cats,
      room,
      checkInDate,
      checkOutDate,
      status: ReservationStatus.PENDING,
    });

    await this.reservationRepository.save(reservation)

    return reservation;
  };


  private async isRoomAvailable(roomId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
    const conflictingReservations = await this.reservationRepository.find({
      where: {
        room: { id: roomId },
        checkInDate: LessThanOrEqual(checkOutDate),
        checkOutDate: MoreThanOrEqual(checkInDate),
      },
    });

    return conflictingReservations.length === 0;
  };

  async findAll(): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      relations: ['user', 'room', 'cat'],
    });
  };

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'room', 'cat'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }
  /* 
    async update(id: string, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
      const reservation = await this.findOne(id);
  
      if (updateReservationDto.userId) {
        const user = await this.userRepository.findOne({ where: { id: updateReservationDto.userId } });
        if (!user) {
          throw new NotFoundException(`User with ID ${updateReservationDto.userId} not found`);
        }
        reservation.user = user;
      }
  
      if (updateReservationDto.roomId) {
        const room = await this.roomRepository.findOne({ where: { id: updateReservationDto.roomId } });
        if (!room) {
          throw new NotFoundException(`Room with ID ${updateReservationDto.roomId} not found`);
        }
        reservation.room = room;
      }
  
  
      if (updateReservationDto.catId) {
        const cat = await this.catRepository.findOne({ where: { id: updateReservationDto.catId } });
        if (!cat) {
          throw new NotFoundException(`Cat with ID ${updateReservationDto.catId} not found`);
        }
        reservation.cat = cat;
      }
  
      Object.assign(reservation, updateReservationDto);
  
      return await this.reservationRepository.save(reservation);
    }
   */

  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.remove(reservation);
  }
}