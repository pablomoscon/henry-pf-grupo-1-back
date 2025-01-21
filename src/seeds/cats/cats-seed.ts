import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from 'src/modules/cats/entities/cat.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { catsMock } from './cats-mock';

@Injectable()
export class CatsSeed {
    constructor(
        @InjectRepository(Cat)
        private readonly catRepository: Repository<Cat>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async seed() {
        const existingCats = (await this.catRepository.find()).map((cat) => cat.id);

        for (const catData of catsMock) {
            if (!existingCats.includes(catData.id)) {
                const cat = new Cat();
                cat.id = catData.id;
                cat.name = catData.name;
                cat.dateOfBirth = catData.dateOfBirth;
                cat.isNeutered = catData.isNeutered;
                cat.personality = catData.personality;
                cat.getsAlongWithOtherCats = catData.getsAlongWithOtherCats;
                cat.food = catData.food;
                cat.vaccinationsAndTests = catData.vaccinationsAndTests;
                cat.user = await this.userRepository.findOne({ where: { id: catData.user.id } });

                await this.catRepository.save(cat);
            }
        }
    }
}