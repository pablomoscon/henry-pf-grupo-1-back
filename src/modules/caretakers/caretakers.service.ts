import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCaretakerDto } from './dto/create-caretaker.dto';
import { UpdateCaretakerDto } from './dto/update-caretaker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Caretaker } from './entities/caretaker.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ReservationsService } from '../reservations/reservations.service';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class CaretakersService {

  constructor(
    @InjectRepository(Caretaker) private readonly caretakerRepository: Repository<Caretaker>,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
    private readonly reservationsService: ReservationsService,
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

  async findUserFromCaretaker(caretakerId: string) {
    const caretaker = await this.caretakerRepository.findOne({
      where: { id: caretakerId },
      relations: ['user'], // Asegúrate de cargar la relación 'user'
    });

    if (!caretaker) {
      throw new HttpException('Caretaker not found', HttpStatus.NOT_FOUND);
    }

    return caretaker.user;
  }

  findAll() {
    return `This action returns all caretakers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caretaker`;
  }

  update(id: number, updateCaretakerDto: UpdateCaretakerDto) {
    return `This action updates a #${id} caretaker`;
  }

  remove(id: number) {
    return `This action removes a #${id} caretaker`;
  }
}
