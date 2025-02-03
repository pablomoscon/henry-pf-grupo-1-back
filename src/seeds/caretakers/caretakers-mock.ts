import { Caretaker } from '../../modules/caretakers/entities/caretaker.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Reservation } from '../../modules/reservations/entities/reservation.entity';
import { Role } from 'src/enums/roles.enum';
import { Status } from 'src/enums/status.enum';

export const caretakersMock: Caretaker[] = [
    {
        id: '123e4567-e89b-12d3-a456-426614174010',
        profileData: 'Experienced cat caretaker with over 5 years in the field.',
        deleted_at: null,
        user: {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Bob Johnson',
            email: 'bob.johnson@mail.com',
            phone: '+5412345681',
            address: '321 Pine St, Star City',
            customerId: '43989097',
            deleted_at: null,
            role: Role.CARETAKER,
            status: Status.ACTIVE,
        } as User
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174011',
        profileData: 'Lifelong animal lover, specializing in shy and rescued cats.',
        deleted_at: null,
        user: {
            id: '123e4567-e89b-12d3-a456-426614174005',
            name: 'Sophia Wilson',
            email: 'sophia.wilson@mail.com',
            phone: '+5412345684',
            address: '753 Cedar St, Smallville',
            customerId: '47981345',
            deleted_at: null,
            role: Role.CARETAKER,
            status: Status.ACTIVE
        } as User
    },
];