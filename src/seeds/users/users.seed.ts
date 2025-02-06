import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { usersMock } from './users-mock';

@Injectable()
export class UsersSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
        user.cats = userData.cats;
        user.reservations = userData.reservations;
        user.sentMessages = userData.sentMessages;
        user.receivedMessages = userData.receivedMessages

        await this.userRepository.save(user);
      }
    }
  }
}
