import { Credential } from '../../modules/credentials/entities/credential.entity';
import { Role } from '../../enums/roles.enum';
import { Status } from '../../enums/status.enum';
import { User } from 'src/modules/users/entities/user.entity';

export const credentialsMock = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    password: 'Pass1234!',
    deleted_at: null,
    user: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Williams',
    email: 'john.williams@mail.com',
    phone: '+5412345678',
    address: '123 Main St, Springfield',
    customerId: '22234768',
    deleted_at: null,
    role: Role.ADMIN,
    status: Status.ACTIVE,
  } as User
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    password: 'Pass1234!',
    deleted_at: null,
    user: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Jane Doe',
      email: 'jane.doe@mail.com',
      phone: '+5412345679',
      address: '456 Elm St, Metropolis',
      customerId: '30987156',
      deleted_at: null,
      role: Role.USER,
      status: Status.ACTIVE
    } as User
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    password: 'Pass1234!',
    deleted_at: null,
    user: {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Alice Smith',
      email: 'alice.smith@mail.com',
      phone: '+5412345680',
      address: '789 Oak St, Gotham',
      customerId: '34987098',
      deleted_at: null,
      role: Role.USER,
      status: Status.ACTIVE
    } as User
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    password: 'Pass1234!',
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
      status: Status.ACTIVE
    } as User
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    password: 'Pass1234!',
    deleted_at: null,
    user: {
      id: '123e4567-e89b-12d3-a456-426614174004',
      name: 'Eve Martinez',
      email: 'eve.martinez@mail.com',
      phone: '+5412345682',
      address: '987 Birch St, Central City',
      customerId: '45980123',
      deleted_at: null,
      role: Role.USER,
      status: Status.INACTIVE,
    } as User
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    password: 'Pass1234!',
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
  }
];
