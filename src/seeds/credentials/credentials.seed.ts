import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from 'src/modules/credentials/entities/credential.entity';
import { Repository } from 'typeorm';
import { credentialsMock } from './credentials-mock';
import { hash } from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class CredentialsSeed {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    for (const credentialData of credentialsMock) {
      const credential = new Credential();
      credential.id = credentialData.id;
      credential.password = await hash(credentialData.password, 10);
      credential.deleted_at = credentialData.deleted_at;
      await this.credentialRepository.save(credential);
    }
  }
}
