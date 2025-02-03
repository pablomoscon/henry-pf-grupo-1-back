import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Caretaker } from './entities/caretaker.entity';
import { CreateCaretakerDto } from './dto/create-caretaker.dto';
import { UpdateCaretakerDto } from './dto/update-caretaker.dto';
import { ReservationsService } from '../reservations/reservations.service';
import { UsersService } from '../users/users.service';


@Injectable()
export class CaretakersService {
  constructor(
    @InjectRepository(Caretaker)
    private readonly caretakerRepository: Repository<Caretaker>,
    private readonly reservationsService: ReservationsService,
    private readonly usersService: UsersService,
  ) { }

  async create(createCaretakerDto: CreateCaretakerDto): Promise<Caretaker> {

    const user = await this.usersService.findOne(createCaretakerDto.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const reservations = [];

    if (createCaretakerDto.reservationsId && createCaretakerDto.reservationsId.length > 0) {
      for (const reservationId of createCaretakerDto.reservationsId) {
        const reservation = await this.reservationsService.findOne(reservationId);
        if (reservation) {
          reservations.push(reservation);
        } else {
          console.error(`Reservation with id ${reservationId} not found`);
        }
      }
    }

    const newCaretaker = this.caretakerRepository.create({
      ...createCaretakerDto,
      user,
      reservations,
    });

    const savedCaretaker = await this.caretakerRepository.save(newCaretaker);
    user.caretakerProfile = savedCaretaker;

    if (savedCaretaker.reservations && savedCaretaker.reservations.length > 0) {
      for (const reservation of savedCaretaker.reservations) {
        reservation.caretakers = [...reservation.caretakers, savedCaretaker];
        await this.reservationsService.update(reservation.id, reservation);
      }
    }

    return savedCaretaker;
  };

  async findAll(): Promise<Caretaker[]> {
    return await this.caretakerRepository.find({
      relations: ['user'],
      where: { deleted_at: IsNull() }
    });
  };

  async findUsersFromCaretakers(caretakerIds: string[]) {
    const caretakers = await this.caretakerRepository.find({
      where: { id: In(caretakerIds), deleted_at: IsNull() },
      relations: ['user'],
    });

    if (caretakers.length === 0) {
      throw new HttpException('Caretakers not found', HttpStatus.NOT_FOUND);
    }

    return caretakers.map(caretaker => caretaker.user);
  };

  async findOne(id: string): Promise<Caretaker> {
    return await this.caretakerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  };

  async update(id: string, updateCaretakerDto: UpdateCaretakerDto) {
    const existingCaretaker = await this.caretakerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!existingCaretaker) {
      throw new HttpException(`Caretaker with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    if (updateCaretakerDto.userId) {
      const user = await this.usersService.findOne(updateCaretakerDto.userId);
      if (!user) {
        throw new Error(`User with ID ${updateCaretakerDto.userId} not found`);
      }
      existingCaretaker.user = user;
    }

    if (updateCaretakerDto.reservationsId) {
      const reservations = [];
      for (const reservationId of updateCaretakerDto.reservationsId) {
        const reservation = await this.reservationsService.findOne(reservationId);
        if (reservation) {
          reservations.push(reservation);
        } else {
          console.error(`Reservation with ID ${reservationId} not found`);
        }
      }
      existingCaretaker.reservations = reservations;
    }

    Object.assign(existingCaretaker, updateCaretakerDto);

    return await this.caretakerRepository.save(existingCaretaker);
  };

  async remove(id: string) {

    const caretaker = await this.caretakerRepository.findOne({ where: { id } });

    if (!caretaker) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    caretaker.deleted_at = new Date();
    return this.caretakerRepository.save(caretaker);
  };

  async findUsersFromReservations(id: string) {

    const caretaker = await this.caretakerRepository.findOne({
      where: {
        user: { id },
        deleted_at: IsNull()
      },
    });

    const reservations = await this.reservationsService.findReservationsByCaretaker(caretaker.id);
    return reservations.map(reservation => reservation);
  };
}

