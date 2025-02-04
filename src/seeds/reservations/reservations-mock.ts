import { Reservation } from '../../modules/reservations/entities/reservation.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Room } from '../../modules/rooms/entities/room.entity';
import { Cat } from '../../modules/cats/entities/cat.entity';
import { ReservationStatus } from '../../enums/reservation-status.enum';
import { Caretaker } from 'src/modules/caretakers/entities/caretaker.entity';
import { Role } from 'src/enums/roles.enum';
import { Status } from 'src/enums/status.enum';

export const reservationsMock: Reservation[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user: { id: '123e4567-e89b-12d3-a456-426614174000' } as User,
    cats: [{ id: '123e4567-e89b-12d3-a456-426614174000' } as Cat],
    room: { id: '123e4567-e89b-12d3-a456-426614174000' } as Room,
    checkInDate: new Date('2025-01-26T09:00:00Z'),
    checkOutDate: new Date('2025-02-10T09:00:00Z'),
    status: ReservationStatus.PENDING,
    createdAt: new Date('2025-01-01T08:00:00Z'),
    updatedAt: new Date('2025-01-05T10:00:00Z'),
    totalAmount: 100.0,
    payments: null,
    caretakers: [],
    messages: []
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    user: { id: '123e4567-e89b-12d3-a456-426614174001' } as User,
    cats: [{ id: '123e4567-e89b-12d3-a456-426614174001' } as Cat],
    room: { id: '123e4567-e89b-12d3-a456-426614174005' } as Room,
    checkInDate: new Date('2025-01-30T09:00:00Z'),
    checkOutDate: new Date('2025-02-06T09:00:00Z'),
    status: ReservationStatus.CONFIRMED,
    createdAt: new Date('2025-01-25T09:00:00Z'),
    updatedAt: new Date('2025-02-03T11:00:00Z'),
    totalAmount: 150.0,
    payments: null,
    caretakers: [{
      id: '123e4567-e89b-12d3-a456-426614174010',
      profileData: 'Experienced cat caretaker with over 5 years in the field.',
      deleted_at: null,
    } as Caretaker],
    messages: []
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    user: { id: '123e4567-e89b-12d3-a456-426614174002' } as User,
    cats: [{ id: '123e4567-e89b-12d3-a456-426614174001' } as Cat],
    room: { id: '123e4567-e89b-12d3-a456-426614174005' } as Room,
    checkInDate: new Date('2024-12-15T09:00:00Z'),
    checkOutDate: new Date('2024-12-25T09:00:00Z'),
    status: ReservationStatus.COMPLETED,
    createdAt: new Date('2024-11-25T09:00:00Z'),
    updatedAt: new Date('2025-02-03T11:00:00Z'),
    totalAmount: 150.0,
    payments: null,
    caretakers: [],
    messages: []
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    user: { id: '123e4567-e89b-12d3-a456-426614174002' } as User,
    cats: [{ id: '123e4567-e89b-12d3-a456-426614174002' } as Cat],
    room: { id: '123e4567-e89b-12d3-a456-426614174003' } as Room,
    checkInDate: new Date('2025-01-27T09:00:00Z'),
    checkOutDate: new Date('2025-01-29T09:00:00Z'),
    status: ReservationStatus.CANCELLED,
    createdAt: new Date('2025-01-02T09:00:00Z'),
    updatedAt: new Date('2025-01-06T11:00:00Z'),
    totalAmount: 150.0,
    payments: null,
    caretakers: [{
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
    } as Caretaker],
    messages: []
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    user: { id: '123e4567-e89b-12d3-a456-426614174004' } as User,
    cats: [{ id: '123e4567-e89b-12d3-a456-426614174003' } as Cat],
    room: { id: '123e4567-e89b-12d3-a456-426614174002' } as Room,
    checkInDate: new Date('2025-01-29T09:00:00Z'),
    checkOutDate: new Date('2025-02-02T09:00:00Z'),
    status: ReservationStatus.CONFIRMED,
    createdAt: new Date('2025-01-30T09:00:00Z'),
    updatedAt: new Date('2025-02-06T11:00:00Z'),
    totalAmount: 150.0,
    payments: null,
    caretakers: [{
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
} as Caretaker],
    messages: []
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    user: { id: '123e4567-e89b-12d3-a456-426614174004' } as User,
    cats: [{ id: '123e4567-e89b-12d3-a456-426614174003' } as Cat],
    room: { id: '123e4567-e89b-12d3-a456-426614174002' } as Room,
    checkInDate: new Date('2025-03-02T09:00:00Z'),
    checkOutDate: new Date('2025-03-11T09:00:00Z'),
    status: ReservationStatus.PENDING,
    createdAt: new Date('2025-02-01T09:00:00Z'),
    updatedAt: new Date('2025-02-01T11:00:00Z'),
    totalAmount: 150.0,
    payments: null,
    caretakers: [{
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
} as Caretaker],
    messages: []
  },
];
