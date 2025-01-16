import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import * as bcrypt from 'bcrypt';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { User } from '../users/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialsRepository: Repository<Credential>,
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

  async createGoogleCredential(createCredentialsDto: CreateCredentialDto): Promise<Credential> {
    const { googleId, password } = createCredentialsDto;
    const hashedCredential = await bcrypt.hash(googleId, 10);

    const googleCredential = this.credentialsRepository.create({
      ...createCredentialsDto,
      googleId: hashedCredential,
    });

    const savedCredential = await this.credentialsRepository.save(googleCredential);

    const hashedPassword = await bcrypt.hash(password, 10);

    savedCredential.password = hashedPassword;

    return await this.credentialsRepository.save(savedCredential);
  };

  async validatePassword(credentialId: string, password: string): Promise<boolean> {
    const credential = await this.credentialsRepository.findOne({ where: { id: credentialId } });

    if (!credential) {
      throw new NotFoundException('Credentials not found');
    }
    return bcrypt.compare(password, credential.password);
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
  };

  async updatePassword(user: User, newPassword: string): Promise<Credential> {
    const credential = await this.credentialsRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (!credential) {
      throw new NotFoundException('Credentials not found');
    }
    credential.password = await bcrypt.hash(newPassword, 10);

    return await this.credentialsRepository.save(credential);
  };
}