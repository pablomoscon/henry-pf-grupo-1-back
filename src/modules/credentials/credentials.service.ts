import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialsRepository: Repository<Credential>,
    private readonly usersService: UsersService,
  ) { }

  async create(createCredentialsDto: CreateCredentialDto): Promise<Credential> {

    const { password } = createCredentialsDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const credential = this.credentialsRepository.create({
      ...createCredentialsDto,
      password: hashedPassword,
    });

    return await this.credentialsRepository.save(credential);
  };

  async findAll(): Promise<Credential[]> {
    return await this.credentialsRepository.find({
      relations: ['user'],
    });
  };

  async findOne(userId: string): Promise<Credential | null> {
    return await this.credentialsRepository.findOne({
      where: { user: { id: userId } },
    });
  };

  async assignUserToCredentials(id: string, updateCredentialsDto: UpdateCredentialDto) {
    const credential = await this.credentialsRepository.findOne({ where: { id } });

    if (!credential) {
      throw new NotFoundException(`Credentials with ID ${id} not found`);
    }
    if (updateCredentialsDto.user) {
      credential.user = updateCredentialsDto.user;
    }
    return await this.credentialsRepository.save(credential);
  }
}