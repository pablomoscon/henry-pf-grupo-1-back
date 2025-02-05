import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { CreateReservationDto } from 'src/modules/reservations/dto/create-reservation.dto';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';
import { CatsService } from '../cats/cats.service';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { Cat } from '../cats/entities/cat.entity';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CaretakersService } from '../caretakers/caretakers.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly usersService: UsersService,
    private readonly roomsService: RoomsService,
    private readonly catsService: CatsService,
    @Inject(forwardRef(() => CaretakersService))
    private readonly caretakersService: CaretakersService,

  ) { }

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { userId, roomId, catsIds, checkInDate, checkOutDate, totalAmount } = createReservationDto;

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
      totalAmount,
      status: ReservationStatus.PENDING,
    });

    await this.reservationRepository.save(reservation)

    return reservation;
  };

async isRoomAvailable(roomId: string, checkInDate: Date, checkOutDate: Date): Promise<boolean> {
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
      where: { deleted_at: IsNull() },
      relations: ['user', 'room', 'cats', 'payments', 'caretakers', 'caretakers.user'],
    });
  };

  async unavailableRoomsDates(roomId: string): Promise<{ reservationId: string }[]> {
    const reservations = await this.reservationRepository.find({
      where: {
        room: { id: roomId },
      },
      select: ["id", "checkInDate", "checkOutDate"],
    });

    return reservations.map(reservation => ({
      reservationId: reservation.id,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
    }));
  };

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'room', 'cats', 'caretakers', 'messages'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  };

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    await this.reservationRepository.update(id, updateReservationDto);
    return this.findOne(id);
  };

  async remove(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    reservation.deleted_at = new Date();
    return this.reservationRepository.save(reservation);
  };

  async updateReservationStatus(reservationId: string, status: ReservationStatus): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id: reservationId } });
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    reservation.status = status;
    return this.reservationRepository.save(reservation);
  };

  async completeExpiredReservations(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredReservations = await this.reservationRepository.find({
      where: {
        checkOutDate: LessThanOrEqual(today),
        status: ReservationStatus.CONFIRMED,
      },
    });

    for (const reservation of expiredReservations) {
      reservation.status = ReservationStatus.COMPLETED;
      await this.reservationRepository.save(reservation);
    }
    console.log(`${expiredReservations.length} reservations have been completed.`);
  };

  async findReservationsByCaretaker(id: string) {

    return await this.reservationRepository.find({
      where: { caretakers: { id }, deleted_at: IsNull() },
      relations: ['user', 'cats', 'room'],
    });
  };

  async addCaretakerToReservation(reservationId: string, userId: string): Promise<Reservation> {

    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['caretakers'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    console.log('userId,' + userId);
    
    const caretaker = await this.caretakersService.findOneByUserId(userId);
    if (!caretaker) {
      throw new NotFoundException('Caretaker not found for the given userId');
    }

    console.log('caretaker:', caretaker.id);
    

    const isCaretakerAlreadyAdded = reservation.caretakers.some(c => c.id === caretaker.id);

    if (isCaretakerAlreadyAdded) {
      throw new HttpException('Caretaker is already assigned to this reservation', HttpStatus.BAD_REQUEST);
    }
    reservation.caretakers.push(caretaker);

    await this.reservationRepository.save(reservation);

    return reservation;
  };

  async findByCheckOutDate(date: moment.Moment): Promise<Reservation[]> {
    const startOfDay = date.startOf('day').toDate();
    return this.reservationRepository.find({
      where: {
        checkOutDate: startOfDay,
      },
      relations: ['user']
    });
  };

  async findUserReservationsById(userId: string): Promise<Reservation[]> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const reservations = await this.reservationRepository.find({
      where: {
        user: { id: userId },
        status: ReservationStatus.CONFIRMED,
        deleted_at: IsNull(),
      },
      relations: ['room', 'cats', 'payments', 'messages', 'caretakers', 'messages'],
    });

    if (reservations.length === 0) {
      throw new NotFoundException(`No reservations found for user with ID ${userId}`);
    }

    return reservations;
  };

  async 

  async findReservationsByRoomAndDate(roomId: string, checkInDate: Date, checkOutDate: Date): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find({
      where: {
        room: { id: roomId },
        checkInDate: LessThanOrEqual(checkOutDate),
        checkOutDate: MoreThanOrEqual(checkInDate),
      },
      relations: ['user', 'room', 'cats'],
    });

    return reservations;
  };

  async removeCaretakerFromReservation(reservationId: string, userId: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['caretakers'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const caretaker = await this.caretakersService.findOneByUserId(userId);
    if (!caretaker || !reservation.caretakers.some(c => c.id === caretaker.id)) {
      throw new HttpException('Caretaker not assigned to this reservation', HttpStatus.BAD_REQUEST);
    }
    reservation.caretakers = reservation.caretakers.filter(c => c.id !== caretaker.id);

    return this.reservationRepository.save(reservation);
  };
}
