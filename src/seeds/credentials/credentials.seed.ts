import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials } from 'src/modules/credentials/entities/credentials.entity';
import { Repository } from 'typeorm';
import { credentialsMock } from './credentials-mock';
import { hash } from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class CredentialsSeed {
  constructor(
    @InjectRepository(Credentials)
    private readonly credentialsRepository: Repository<Credentials>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async seed() {
    for (const credentialsData of credentialsMock) {
      const credentials = new Credentials();
      credentials.id = credentialsData.id;
      credentials.password = await hash(credentialsData.password, 10);
      credentials.deleted_at = credentialsData.deleted_at;
      credentials.user = {
        id: credentialsData.user.id,
        name: credentialsData.user.name,
        email: credentialsData.user.email,
        phone: credentialsData.user.phone,
        birthdate: credentialsData.user.birthdate,
        deleted_at: null,
        role: credentialsData.user.role,
        status: credentialsData.user.status,
        credentials: null,
        cats: [],
        caretakers: [],
        reservations: [],
        sentMessages: [],
        receivedMessages: [],
      };

      await this.credentialsRepository.save(credentials);
    }
  }
}
