import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { Credential } from '../credentials/entities/credential.entity';
import { Cat } from '../cats/entities/cat.entity';
import { Role } from 'src/enums/roles.enum';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto, credential: Credential): Promise<User> {
    const newUser = this.userRepository.create({
      ...createUserDto,
      credential,
    });
    return await this.userRepository.save(newUser);
  };

  async findByEmailWithCredentials(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['credential'],
    });
  };

  async findAll(pageNumber: number, limitNumber: number) {
    return await this.userRepository.find({
      where: { deleted_at: IsNull() },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      relations: ['reservations', 'cats'],
    });
  };

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['credential'],
    });
    return user;
  };

  async findOne(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['reservations', 'cats'],
    });
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
      where: { id },
      relations: ['cats'],
    });
    return user?.cats.map(cat => ({ id: cat.id, name: cat.name })) || [];
  };

  async findCaretakers(pageNumber: number, limitNumber: number) {
    return await this.userRepository.find({
      where: { role: Role.CARETAKER, deleted_at: IsNull() },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      relations: ['caretakerProfile', 'reservations', 'cats'],
    });
  };
}
