import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './entities/credential.entity'; // Asegúrate de importar Credential correctamente
import { UsersService } from '../users/users.service'; // Asegúrate de que UsersService esté correctamente importado

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly usersService: UsersService, // Para cargar el usuario
  ) { }

  async create(createCredentialDto: CreateCredentialDto, userId: string): Promise<Credential> {
    
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newCredential = this.credentialRepository.create(createCredentialDto);

    newCredential.user = user;

    return await this.credentialRepository.save(newCredential);
  };

  async findOne(userId: string): Promise<Credential | null> {
    return await this.credentialRepository.findOne({
      where: { user: { id: userId } },
    });
  };
}