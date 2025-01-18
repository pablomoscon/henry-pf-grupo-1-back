import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';

@Injectable()

export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
    private readonly usersService: UsersService,
  ) { }

  async create(createCatDto: CreateCatDto) {

    const user = await this.usersService.findOne(createCatDto.userId);
    if (!user) {
      throw new BadRequestException('There is no user with that ID.');
    }
    const newCat = this.catRepository.create({
      ...createCatDto,
      user,
    });
    await this.catRepository.save(newCat);
    return newCat;
  };

  async findAll() {
    return await this.catRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['user', 'reservations'],
    });
  };

  async findOne(id: string) {
    return await this.catRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  };

  async update(id: string, updateCatDto: UpdateCatDto) {
    await this.catRepository.update(id, updateCatDto);
    return this.findOne(id);
  };

  async remove(id: string) {
    const cat = await this.catRepository.findOne({ where: { id } });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    cat.deleted_at = new Date();
    return this.catRepository.save(cat);
  };

  async isCatOwnedByUser(catId: string, userId: string): Promise<boolean> {
    const cat = await this.catRepository.findOne({ where: { id: catId, user: { id: userId } } });
    if (!cat) {
      throw new Error('The cat does not belong to the user.');
    }
    return true;
  };
}