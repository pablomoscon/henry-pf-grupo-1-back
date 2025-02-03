import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caretaker } from 'src/modules/caretakers/entities/caretaker.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { caretakersMock } from './caretakers-mock';


@Injectable()
export class CaretakersSeed {
    constructor(
        @InjectRepository(Caretaker)
        private readonly caretakerRepository: Repository<Caretaker>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async seed() {
        const existingCaretakers = (await this.caretakerRepository.find()).map(caretaker => caretaker.id);
        const existingUsers = await this.userRepository.find();

        for (const caretakerData of caretakersMock) {

            if (!existingCaretakers.includes(caretakerData.id)) {
                const caretaker = new Caretaker();
                caretaker.id = caretakerData.id;
                caretaker.profileData = caretakerData.profileData;
                caretaker.deleted_at = caretakerData.deleted_at;

                const user = existingUsers.find(user => user.id === caretakerData.user.id);
                if (!user) {
                    throw new Error(`User with ID ${ caretakerData.user.id } not found.`);
                }
                caretaker.user = user;

                await this.caretakerRepository.save(caretaker);
            }
        }
    }
}