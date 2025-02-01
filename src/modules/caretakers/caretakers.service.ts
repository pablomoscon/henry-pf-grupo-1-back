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
    const location = await this.locationsService.findOne(createCaretakerDto.locationId);
    const reservations = [];
    for (const reservationId of createCaretakerDto.reservationsId) {
      const reservation = await this.reservationsService.findOne(reservationId);  // Suponiendo que existe un método findOne
      if (reservation) {
        reservations.push(reservation);
      } else {
        console.error(`Reservation with id ${reservationId} not found`);
      }
    };

    if (!user || !location) {
      throw new Error('User or Location not found');
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
      where: { id: In(caretakerIds) },  // 'In' permite buscar varios cuidadores al mismo tiempo
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
    const existingCaretaker = await this.caretakerRepository.findOne({ where: { id } });
    if (!existingCaretaker) {
      throw new HttpException(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    await this.caretakerRepository.update(id, updateCaretakerDto);

    return this.findOne(id);
  };

  async remove(id: string) {

    const caretaker = await this.caretakerRepository.findOne({ where: { id } });

    if (!caretaker) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    caretaker.deleted_at = new Date();
    return this.caretakerRepository.save(caretaker);
  };
}

