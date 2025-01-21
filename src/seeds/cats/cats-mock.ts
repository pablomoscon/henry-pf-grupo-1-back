import { Cat } from 'src/modules/cats/entities/cat.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CatVaccinations } from 'src/enums/cat-vaccinations.enum';
import { CatCompatibility } from 'src/enums/cat-compatibility.enum';

export const catsMock: Cat[] = [
    {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Whiskers Purrington',
        dateOfBirth: new Date('2022-06-15'),
        isNeutered: true,
        personality: 'Playful and friendly',
        getsAlongWithOtherCats: CatCompatibility.YES,
        food: 'Dry food and wet food',
        vaccinationsAndTests: [CatVaccinations.RABIES, CatVaccinations.TRIPLE_FELINE],
        user: { id: '123e4567-e89b-12d3-a456-426614174000' } as User,
        media: [], 
        reservations: [], 
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Bella Meowster',
        dateOfBirth: new Date('2021-10-10'),
        isNeutered: false,
        personality: 'Shy and reserved',
        getsAlongWithOtherCats: CatCompatibility.NO,
        food: 'Wet food only',
        vaccinationsAndTests: [CatVaccinations.FIV_FELV_TEST],
        user: { id: '123e4567-e89b-12d3-a456-426614174001' } as User,
        media: [],
        reservations: [],
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Shadow Paws',
        dateOfBirth: new Date('2023-01-05'),
        isNeutered: true,
        personality: 'Curious and energetic',
        getsAlongWithOtherCats: CatCompatibility.UNSURE,
        food: 'Mixed food (dry and wet)',
        vaccinationsAndTests: [CatVaccinations.RABIES],
        user: { id: '123e4567-e89b-12d3-a456-426614174002' } as User,
        media: [],
        reservations: [],
    },
];