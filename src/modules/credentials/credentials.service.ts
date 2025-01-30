import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Credential } from './entities/credential.entity';
import * as bcrypt from 'bcrypt';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialsRepository: Repository<Credential>,
  ) { }

  async create(createCredentialsDto: CreateCredentialDto): Promise<Credential> {
    const { password, passwordExpiration } = await this.handlePasswordAndExpiration(createCredentialsDto);

    const hashedPassword = await bcrypt.hash(password, 10);

    const credential = this.credentialsRepository.create({
      ...createCredentialsDto,
      password: hashedPassword,
      passwordExpiration,
    });

    return this.credentialsRepository.save(credential);
  };

  private async handlePasswordAndExpiration(createCredentialsDto: CreateCredentialDto): Promise<{ password: string, passwordExpiration: Date }> {
    let { password, passwordExpiration } = createCredentialsDto;

    if (!password) {
      password = crypto.randomBytes(16).toString('hex');
      passwordExpiration = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 horas
    }

    return { password, passwordExpiration };
  };

  async createGoogleCredential(createCredentialsDto: CreateCredentialDto): Promise<Credential> {
    const { googleId, password } = createCredentialsDto;

    const hashedCredential = await bcrypt.hash(googleId, 10);
    const { password: generatedPassword, passwordExpiration } = await this.handlePasswordAndExpiration(createCredentialsDto);

    const googleCredential = this.credentialsRepository.create({
      ...createCredentialsDto,
      googleId: hashedCredential,
      password: await bcrypt.hash(generatedPassword, 10),
      passwordExpiration,
    });

    return await this.credentialsRepository.save(googleCredential);
  };

  async validatePassword(credentialId: string, password: string): Promise<boolean> {
    const credential = await this.credentialsRepository.findOne({ where: { id: credentialId } });

    if (!credential) {
      throw new NotFoundException('Credentials not found');
    }

    if (new Date() > new Date(credential.passwordExpiration)) {
      throw new UnauthorizedException('Password has expired');
    }
    
    return bcrypt.compare(password, credential.password);
  };

  async findAll(): Promise<Credential[]> {
    return await this.credentialsRepository.find({
      where: { deleted_at: IsNull() },
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