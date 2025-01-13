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
      credential.user = {
        id: credentialData.user.id,
        name: credentialData.user.name,
        email: credentialData.user.email,
        phone: credentialData.user.phone,
        birthdate: credentialData.user.birthdate,
        deleted_at: null,
        role: credentialData.user.role,
        status: credentialData.user.status,
        credential: null,
        cats: [],
        caretakers: [],
        reservations: [],
        sentMessages: [],
        receivedMessages: [],
      };

      await this.credentialRepository.save(credential);
    }
  }
}
