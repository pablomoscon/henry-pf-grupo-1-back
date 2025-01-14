import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './entities/credential.entity'; // Asegúrate de importar Credential correctamente
import { UsersService } from '../users/users.service'; // Asegúrate de que UsersService esté correctamente importado
import * as bcrypt from 'bcrypt';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly usersService: UsersService,
  ) { }

  async create(createCredentialDto: CreateCredentialDto, userId: string): Promise<Credential> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(createCredentialDto.password, 10);

    const newCredential = this.credentialRepository.create({
      ...createCredentialDto,
      password: hashedPassword, 
    });

    newCredential.user = user;

    return await this.credentialRepository.save(newCredential);
  };

  async findOne(userId: string): Promise<Credential | null> {
    return await this.credentialRepository.findOne({
      where: { user: { id: userId } },
    });
  };
}