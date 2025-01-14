import { Injectable } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
  ) { }

  async create (credentials: CredentialDto): Promise<Credential> => {
    const { password } = credentials;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newCredentials = await credentialRepository.create({
      username,
      password: hashedPassword,
    });

    credentialRepository.save(newCredentials);

    return await newCredentials;
  };

}
