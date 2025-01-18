import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { CreateReservationDto } from 'src/modules/reservations/dto/create-reservation.dto';
import { UpdateReservationDto } from 'src/modules/reservations/dto/update-reservation.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { Cat } from 'src/modules/cats/entities/cat.entity';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';
import { CatsService } from '../cats/cats.service';
import { ReservationStatus } from 'src/enums/reservation-status.enum';

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
    const { userId, roomId, catId, checkInDate, checkOutDate, status } = createReservationDto;
  
    const isUsersCat = await this.catsService.isCatOwnedByUser(catId, userId);
    if (!isUsersCat) {
      throw new BadRequestException('Cat is not owned by user');
    };

    const isRoomAvailable = await this.isRoomAvailable(roomId, checkInDate, checkOutDate);

    if (!isRoomAvailable) {
      throw new Error("The room is not available for the selected dates");
    };

    const user = await this.usersService.findOne(userId)
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const room = await this.roomsService.findOne(roomId)
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const cat = await this.catsService.findOne(catId)
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }

    const reservation: Reservation = await this.reservationRepository.create({
      user,
      cat,
      room,
      checkInDate,
      checkOutDate,
      status: ReservationStatus.PENDING,
    });

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
  }

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