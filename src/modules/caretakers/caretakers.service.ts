import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caretaker } from './entities/caretaker.entity';
import { CreateCaretakerDto } from './dto/create-caretaker.dto';
import { UpdateCaretakerDto } from './dto/update-caretaker.dto';
import { Reservation } from '../reservations/entities/reservation.entity';
import { User } from '../users/entities/user.entity';
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
    const { userId, profileData, locationId, reservationIds } = createCaretakerDto;

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const location = await this.locationsService.findOne(locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    const reservations = reservationIds?.length
      ? await Promise.all(reservationIds.map(id => this.reservationsService.findOne(id)))
      : [];

    const caretaker = this.caretakerRepository.create({
      user,
      profileData,
      location,
      reservations,
    });

    return await this.caretakerRepository.save(caretaker);
  };

  async findAll(): Promise<Caretaker[]> {
    return await this.caretakerRepository.find({
      relations: ['user', 'reservations'],
    });
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

