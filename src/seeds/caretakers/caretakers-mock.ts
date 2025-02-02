import { Caretaker } from '../../modules/caretakers/entities/caretaker.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Location } from '../../modules/locations/entities/location.entity';
import { Reservation } from '../../modules/reservations/entities/reservation.entity';

export const caretakersMock: Caretaker[] = [
    {
        id: '123e4567-e89b-12d3-a456-426614174010',
        user: { id: '123e4567-e89b-12d3-a456-426614174003' } as User,
        profileData: 'Experienced cat caretaker with over 5 years in the field.',
        deleted_at: null,
        location: { id: '123e4567-e89b-12d3-a456-426614174030' } as Location,
        reservations: []
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174011',
        user: { id: '123e4567-e89b-12d3-a456-426614174005' } as User,
        profileData: 'Lifelong animal lover, specializing in shy and rescued cats.',
        deleted_at: null,
        location: { id: '123e4567-e89b-12d3-a456-426614174031' } as Location,
        reservations: [],
    },
];