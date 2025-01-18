import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { In, Repository } from 'typeorm';
import { reservationsMock } from './reservations-mock';
import { User } from 'src/modules/users/entities/user.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { Cat } from 'src/modules/cats/entities/cat.entity';

@Injectable()
export class ReservationsSeed {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) { }

  async seed() {
    const existingReservations = (await this.reservationRepository.find()).map(
      (reservation) => reservation.id,
    );

    for (const reservationData of reservationsMock) {
      if (!existingReservations.includes(reservationData.id)) {
        const reservation = new Reservation();
        reservation.id = reservationData.id;
        reservation.checkInDate = reservationData.checkInDate;
        reservation.checkOutDate = reservationData.checkOutDate;
        reservation.status = reservationData.status;
        reservation.createdAt = reservationData.createdAt;
        reservation.updatedAt = reservationData.updatedAt;

        reservation.user = await this.userRepository.findOne({
          where: { id: reservationData.user.id },
        });

        reservation.room = await this.roomRepository.findOne({
          where: { id: reservationData.room.id },
        });

        reservation.cats = await this.catRepository.find({
          where: { id: In(reservationData.cats.map(cat => cat.id)) },
        });

        await this.reservationRepository.save(reservation);
      }
    }
  }
}
  