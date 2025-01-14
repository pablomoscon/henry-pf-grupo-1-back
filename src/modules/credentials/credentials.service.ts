import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCredentialsDto } from './dto/create-credentials.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credentials } from './entities/credentials.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credentials)
    private readonly credentialsRepository: Repository<Credentials>,
    private readonly usersService: UsersService,
  ) { }

  async create(createCredentialsDto: CreateCredentialsDto): Promise<Credentials> {

    const { password } = createCredentialsDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const credential = this.credentialsRepository.create({
      ...createCredentialsDto,
      password: hashedPassword,
    });

    return await this.credentialsRepository.save(credential);
  };

  async findAll(): Promise<Credentials[]> {
    return await this.credentialsRepository.find({
      relations: ['user'],
    });
  };

  async findOne(userId: string): Promise<Credentials | null> {
    return await this.credentialsRepository.findOne({
      where: { user: { id: userId } },
    });
  };

  async assignUserToCredentials (id: string, updateCredentialsDto: UpdateCredentialsDto) {
    const credentials = await this.credentialsRepository.findOne({ where: { id } });

    if (!credentials) {
      throw new NotFoundException(`Credentials with ID ${id} not found`);
    }
    if (updateCredentialsDto.user) {
      credentials.user = updateCredentialsDto.user;
    }
    return await this.credentialsRepository.save(credentials);
  }
}