import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import * as bcrypt from 'bcrypt';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialsRepository: Repository<Credential>,
  ) { }

  async create(createCredentialsDto: CreateCredentialDto, user: User): Promise<Credential> {
    const { password } = createCredentialsDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const credential = this.credentialsRepository.create({
      ...createCredentialsDto,
      password: hashedPassword,
      user
    });

    return this.credentialsRepository.save(credential);
  };

  async createGoogleCredential(createCredentialsDto: CreateCredentialDto, user: User): Promise<Credential> {
    const { googleId } = createCredentialsDto;

    const hashedCredential = await bcrypt.hash(googleId, 10);
    const { password: generatedPassword } = await this.handlePassword(createCredentialsDto);

    const googleCredential = this.credentialsRepository.create({
      ...createCredentialsDto,
      googleId: hashedCredential,
      password: await bcrypt.hash(generatedPassword, 10),
      user
    });

    return await this.credentialsRepository.save(googleCredential);
  };

  private async handlePassword(createCredentialsDto: CreateCredentialDto): Promise<{ password: string }> {
    let { password } = createCredentialsDto;

    if (!password) {
      password = crypto.randomBytes(16).toString('hex');
    }

    return { password };
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
      where: { deleted_at: IsNull() },
      relations: ['user'],
    });
  };

  async findOne(id: string): Promise<Credential | null> {
    return await this.credentialsRepository.findOne({
      where: { user: { id } },
    });
  };

  async findCredentialByUser(id: string): Promise<Credential | null> {
    return await this.credentialsRepository.findOne({
      where: { user: { id: id } },
      relations: ['user'],
    });
  };

  async updatePassword(
    id: string,
    updateCredentialDto: UpdateCredentialDto
  ): Promise<Credential> {
    const { newPassword, confirmPassword } = updateCredentialDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    const credential = await this.credentialsRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (!credential) {
      throw new NotFoundException('Credentials not found');
    }

    credential.password = await bcrypt.hash(newPassword, 10);

    return await this.credentialsRepository.save(credential);
  };
}
