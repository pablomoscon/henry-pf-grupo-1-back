import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caretaker } from 'src/modules/caretakers/entities/caretaker.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Location } from 'src/modules/locations/entities/location.entity';
import { caretakersMock } from './caretakers-mock';

@Injectable()
export class CaretakersSeed {
    constructor(
        @InjectRepository(Caretaker)
        private readonly caretakerRepository: Repository<Caretaker>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Location)
        private readonly locationRepository: Repository<Location>,
    ) { }

    async seed() {
        const existingCaretakers = (await this.caretakerRepository.find()).map(caretaker => caretaker.id);

        for (const caretakerData of caretakersMock) {
            if (!existingCaretakers.includes(caretakerData.id)) {
                const caretaker = new Caretaker();
                caretaker.id = caretakerData.id;
                caretaker.profileData = caretakerData.profileData;
                caretaker.deleted_at = caretakerData.deleted_at;

                caretaker.user = await this.userRepository.findOne({ where: { id: caretakerData.user.id } });
                caretaker.location = await this.locationRepository.findOne({ where: { id: caretakerData.location.id } });

                await this.caretakerRepository.save(caretaker);
            }
        }
    }
}
