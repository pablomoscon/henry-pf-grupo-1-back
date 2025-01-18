import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';

@Entity()
export class Payment {
    @ApiProperty({
        description: 'Unique identifier of the payment',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'User who made the payment',
        type: () => User,
    })
    @ManyToOne(() => User, (user) => user.payments, { nullable: false })
    user: User;

    @ApiProperty({
        description: 'Reservation associated with the payment',
        type: () => Reservation,
    })
    @ManyToOne(() => Reservation, (reservation) => reservation.payments, { nullable: false })
    reservation: Reservation;

    @ApiProperty({
        description: 'Amount of the payment',
        example: 150.75,
    })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @ApiProperty({
        description: 'Currency used in the payment',
        example: 'usd',
        default: 'usd',
    })
    @Column({ default: 'usd' })
    currency: string;

    @ApiProperty({
        description: 'Stripe PaymentIntent ID',
        example: 'pi_1GqIC8ClCIKljWqX9l1XQ0HF',
    })
    @Column()
    paymentIntentId: string;

    @ApiProperty({
        description: 'Status of the payment',
        example: 'succeeded',
        default: 'pending',
    })
    @Column({ default: 'pending' })
    status: string;

    @ApiProperty({
        description: 'Date when the payment was created',
        example: '2024-01-18T12:34:56Z',
    })
    @CreateDateColumn()
    createdAt: Date;
}