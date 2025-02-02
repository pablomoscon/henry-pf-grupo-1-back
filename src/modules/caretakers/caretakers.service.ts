import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Caretaker } from './entities/caretaker.entity';
import { CreateCaretakerDto } from './dto/create-caretaker.dto';
import { UpdateCaretakerDto } from './dto/update-caretaker.dto';
import { ReservationsService } from '../reservations/reservations.service';
import { UsersService } from '../users/users.service';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class CaretakersService {
  constructor(
    @InjectRepository(Caretaker)
    private readonly caretakerRepository: Repository<Caretaker>,
    private readonly reservationsService: ReservationsService,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
  ) { }

  async create(createCaretakerDto: CreateCaretakerDto): Promise<Caretaker> {
    const user = await this.usersService.findOne(createCaretakerDto.userId);
    // Se omite la búsqueda de location si no se pasa un locationId
    const location = createCaretakerDto.locationId
      ? await this.locationsService.findOne(createCaretakerDto.locationId)
      : undefined;

    const reservations = [];

    // Verificar si el usuario existe
    if (!user) {
      throw new Error('User not found');
    }

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
      location,               
      reservations,           
    });

    return await this.caretakerRepository.save(newCaretaker);
  }

  async findAll(): Promise<Caretaker[]> {
    return await this.caretakerRepository.find({
      relations: ['user', 'reservations'],
    });
  };

  async findUsersFromCaretakers(caretakerIds: string[]) {
    const caretakers = await this.caretakerRepository.find({
      where: { id: In(caretakerIds) },
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
      relations: ['user', 'reservations'],
    });
  };

  async update(id: string, updateCaretakerDto: UpdateCaretakerDto) {
    const existingCaretaker = await this.caretakerRepository.findOne({
      where: { id },
      relations: ['user', 'location', 'reservations'], // Cargar relaciones existentes
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

    if (updateCaretakerDto.locationId) {
      const location = await this.locationsService.findOne(updateCaretakerDto.locationId);
      if (!location) {
        throw new Error(`Location with ID ${updateCaretakerDto.locationId} not found`);
      }
      existingCaretaker.location = location;
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

  async findUsersFromReservations(caretakerIds: string[]) {
  
    const caretakers = await this.caretakerRepository.find({
      where: { id: In(caretakerIds) },
      relations: ['reservations', 'reservations.user'],
    });

    if (caretakers.length === 0) {
      throw new HttpException('Caretakers not found', HttpStatus.NOT_FOUND);
    }

    const users = caretakers.flatMap(caretaker =>
      caretaker.reservations.map(reservation => ({
        reservation: reservation, 
        user: reservation.user,  
      }))
    );

    return users;
  };
}

