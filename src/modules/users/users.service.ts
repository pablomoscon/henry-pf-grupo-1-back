import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { Role } from 'src/enums/roles.enum';
import { CaretakersService } from '../caretakers/caretakers.service';
import { CredentialsService } from '../credentials/credentials.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => CaretakersService)) 
    private readonly caretakersService: CaretakersService,
    private readonly credentialsService: CredentialsService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto
    );
    return await this.userRepository.save(newUser);
  };

  async findCredentialByEmail(email: string) {
    
    const user = await this.userRepository.findOne({
      where: { email, deleted_at: IsNull() },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const credential = await this.credentialsService.findCredentialByUser(user.id);

    if (!credential) {
      throw new BadRequestException('Credential not found');
    }

    return credential;
  };

  async findAll(pageNumber: number, limitNumber: number) {
    return await this.userRepository.find({
      where: { deleted_at: IsNull() },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      relations: ['reservations', 'cats'],
    });
  };

  async findUsersWithReservations() {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.reservations', 'reservation')
      .where('reservation.id IS NOT NULL')
      .andWhere('user.deleted_at IS NULL')
      .getMany();
  };

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, deleted_at: IsNull() }
    });
    return user;
  };

  async findOne(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['reservations', 'cats'],
    });
  };

  async findUsersAndReservationsFromCaretaker(id: string) {
    
    return await this.caretakersService.findUsersFromReservations(id)
  };

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new HttpException(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    await this.userRepository.update(id, updateUserDto);

    return this.findOne(id);
  };

  async remove(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.deleted_at = new Date();
    return this.userRepository.save(user);
  };

  async usersCats(id: string): Promise<{ id: string; name: string }[]> {
    const user = await this.userRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['cats'],
    });
    return user?.cats.map(cat => ({ id: cat.id, name: cat.name })) || [];
  };

  async findCaretakers(pageNumber: number, limitNumber: number) {
    return await this.userRepository.find({
      where: { role: Role.CARETAKER, deleted_at: IsNull() },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      relations: [ 'reservations', 'cats'],
    });
  };

  async findUserRole(pageNumber: number, limitNumber: number) {
    return await this.userRepository.find({
      where: { role: Role.USER, deleted_at: IsNull() },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      relations: ['reservations', 'cats', 'reviews', 'sentMessages', 'receivedMessages'],
    });
  };
}
