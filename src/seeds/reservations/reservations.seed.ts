import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Repository } from 'typeorm';
import { reservationsMock } from './reservations-mock';
import { User } from 'src/modules/users/entities/user.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';

@Injectable()
export class ReservationsSeed {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async seed() {
    const existingReservations = (await this.reservationRepository.find()).map(
      (reservation) => reservation.id,
    );
    for (const reservationData of reservationsMock) {
      if (!existingReservations.includes(reservationData.id)) {
        const reservation = new Reservation();
        reservation.id = reservationData.id;
        reservation.initial_date = reservationData.initial_date;
        reservation.ending_date = reservationData.ending_date;
        reservation.deleted_at = reservationData.deleted_at;
        reservation.user = await this.userRepository.findOne({
          where: { id: reservationData.user.id },
        });
        reservation.room = await this.roomRepository.findOne({
          where: { id: reservationData.room.id },
        });
        await this.reservationRepository.save(reservation);
      }
    }
  }
}
