import { Reservation } from '../../modules/reservations/entities/reservation.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Room } from '../../modules/rooms/entities/room.entity';
import { Cat } from '../../modules/cats/entities/cat.entity';
import { ReservationStatus } from '../../enums/reservation-status.enum';

export const reservationsMock: Reservation[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user: { id: '123e4567-e89b-12d3-a456-426614174000' } as User,
    cats: [
      { id: '123e4567-e89b-12d3-a456-426614174002' } as Cat,
    ],
    room: { id: '123e4567-e89b-12d3-a456-426614174000' } as Room,
    checkInDate: new Date('2025-01-09'),
    checkOutDate: new Date('2025-01-10'),
    status: ReservationStatus.PENDING,
    createdAt: new Date('2025-01-01T08:00:00Z'),
    updatedAt: new Date('2025-01-05T10:00:00Z'),
    totalAmount: 100.00, 
    payments: null,
    messages:[]
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    user: { id: '123e4567-e89b-12d3-a456-426614174001' } as User,
    cats: [
      { id: '123e4567-e89b-12d3-a456-426614174003' } as Cat,
    ],
    room: { id: '123e4567-e89b-12d3-a456-426614174001' } as Room,
    checkInDate: new Date('2025-01-11'),
    checkOutDate: new Date('2025-01-12'),
    status: ReservationStatus.CONFIRMED,
    createdAt: new Date('2025-01-02T09:00:00Z'),
    updatedAt: new Date('2025-01-06T11:00:00Z'),
    totalAmount: 150.00,
    payments: null,
    messages: []
  },
];