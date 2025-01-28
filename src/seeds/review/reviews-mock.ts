import { Review } from 'src/modules/reviews/entities/review.entity';
import { User } from 'src/modules/users/entities/user.entity';


export const reviewsMock: Review[] = [
    {
        id: '001e4567-e89b-12d3-a456-426614174000',
        textBody: 'The service was absolutely amazing! Everyone was super friendly and helpful and they went above and beyond to meet my expectations. I’ll definitely come back again',
        rating: 5,
        user: { id: '123e4567-e89b-12d3-a456-426614174000' } as User, 
        deleted_at: null,
    },
    {
        id: '002e4567-e89b-12d3-a456-426614174001',
        textBody: 'It was a good experience overall. The staff was polite, but the waiting time was a bit longer than expected. Still, I’d recommend it to others.',
        rating: 4,
        user: { id: '123e4567-e89b-12d3-a456-426614174001' } as User, 
        deleted_at: null,
    },
    {
        id: '003e4567-e89b-12d3-a456-426614174002',
        textBody: 'The experience was okay, but I believe there is room for improvement in terms of organization and communication. It felt a bit rushed.',
        rating: 3,
        user: { id: '123e4567-e89b-12d3-a456-426614174002' } as User, 
        deleted_at: null,
    },
    {
        id: '004e4567-e89b-12d3-a456-426614174003',
        textBody: 'I’m beyond satisfied with the attention to detail and the quality of the service provided. It was such a smooth process from start to finish!',
        rating: 5,
        user: { id: '123e4567-e89b-12d3-a456-426614174003' } as User, 
        deleted_at: null,
    },
    {
        id: '005e4567-e89b-12d3-a456-426614174004',
        textBody: 'The service met my expectations, nothing out of the ordinary but still a good experience overall. I appreciate their effort."',
        rating: 4,
        user: { id: '123e4567-e89b-12d3-a456-426614174004' } as User, 
        deleted_at: null,
    },
];