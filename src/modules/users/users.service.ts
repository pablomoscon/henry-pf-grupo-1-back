import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
      const newUser = this.userRepository.create(createUserDto);
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
      relations: ['reservations', 'cats','credential'],
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
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  };

  async remove(id: string): Promise<User> {
    const room = await this.userRepository.findOne({ where: { id } });

    if (!room) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    room.deleted_at = new Date();
    return this.userRepository.save(room);
  };
  
}