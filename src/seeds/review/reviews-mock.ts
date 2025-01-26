import { Review } from 'src/modules/reviews/entities/review.entity';
import { User } from 'src/modules/users/entities/user.entity';


export const reviewsMock: Review[] = [
    {
        id: '001e4567-e89b-12d3-a456-426614174000',
        textBody: 'The service was amazing! Highly recommended.',
        calification: 5,
        user: { id: '123e4567-e89b-12d3-a456-426614174000' } as User, 
        deleted_at: null,
    },
    {
        id: '002e4567-e89b-12d3-a456-426614174001',
        textBody: 'The waiting time was a bit long, but good service overall.',
        calification: 4,
        user: { id: '123e4567-e89b-12d3-a456-426614174001' } as User, 
        deleted_at: null,
    },
    {
        id: '003e4567-e89b-12d3-a456-426614174002',
        textBody: 'Average experience, could use some improvements.',
        calification: 3,
        user: { id: '123e4567-e89b-12d3-a456-426614174002' } as User, 
        deleted_at: null,
    },
    {
        id: '004e4567-e89b-12d3-a456-426614174003',
        textBody: 'Exceptional service! Everything was perfect.',
        calification: 5,
        user: { id: '123e4567-e89b-12d3-a456-426614174003' } as User, 
        deleted_at: null,
    },
    {
        id: '005e4567-e89b-12d3-a456-426614174004',
        textBody: 'Good service, but not extraordinary.',
        calification: 4,
        user: { id: '123e4567-e89b-12d3-a456-426614174004' } as User, 
        deleted_at: new Date('2025-01-15T10:00:00Z'),
    },
];