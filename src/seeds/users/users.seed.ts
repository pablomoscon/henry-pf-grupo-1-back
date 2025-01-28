import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { usersMock } from './users-mock';
import { Credential } from 'src/modules/credentials/entities/credential.entity';

@Injectable()
export class UsersSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
  ) {}

  async seed() {
    const existingUser = (await this.userRepository.find()).map(
      (user) => user.name,
    );
    for (const userData of usersMock) {
      if (!existingUser.includes(userData.name)) {
        const user = new User();
        user.id = userData.id;
        user.name = userData.name;
        user.email = userData.email;
        user.phone = userData.phone;
        user.address = userData.address;
        user.customerId = userData.customerId;
        user.deleted_at = userData.deleted_at;
        user.role = userData.role;
        user.status = userData.status;
        user.credential = await this.credentialRepository.findOne({
          where: { id: userData.credential.id },
        });
        user.cats = userData.cats;
        user.caretakerProfile = userData.caretakerProfile;
        user.reservations = userData.reservations;
        user.sentMessages = userData.sentMessages;
        user.receivedMessages = userData.receivedMessages;
        user.sentChats = userData.sentChats;
        user.receivedChats = userData.receivedChats;

        await this.userRepository.save(user);
      }
    }
  }
}
