import { Reservation } from '../../modules/reservations/entities/reservation.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Room } from '../../modules/rooms/entities/room.entity';

export const reservationsMock: Reservation[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    initial_date: new Date('2025-01-09'),
    ending_date: new Date('2025-01-10'),
    deleted_at: null,
    user: { id: '123e4567-e89b-12d3-a456-426614174000' } as User,
    room: { id: '123e4567-e89b-12d3-a456-426614174000' } as Room,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    initial_date: new Date('2025-01-11'),
    ending_date: new Date('2025-01-12'),
    deleted_at: null,
    user: { id: '123e4567-e89b-12d3-a456-426614174001' } as User,
    room: { id: '123e4567-e89b-12d3-a456-426614174001' } as Room,
  },
];
