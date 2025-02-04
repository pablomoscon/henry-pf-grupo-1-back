import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { IsOptional } from 'class-validator';
import { PaymentStatus } from 'src/enums/payment-status.enum';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        description: 'Unique identifier of the payment',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    })
    id: string;


    @Column({ type: 'decimal', precision: 10, scale: 2 })
    @ApiProperty({
        description: 'Amount of the payment',
        example: 150.75,
    })
    totalAmount: number;

    @Column({ default: 'usd' })
    @ApiProperty({
        description: 'Currency used in the payment',
        example: 'usd',
        default: 'usd',
    })
    currency: string;

    @Column()
    @ApiProperty({
        description: 'Unique identifier for the Stripe payment session.',
        example: 'pi_1GqIC8ClCIKljWqX9l1XQ0HF',
    })
    sessionId: string;

    @Column({ default: PaymentStatus.PENDING })
    @ApiProperty({
        description: 'Status of the payment',
        example: PaymentStatus.SUCCEEDED,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @CreateDateColumn()
    @ApiProperty({
        description: 'Date when the payment was created',
        example: '2024-01-18T12:34:56Z',
    })
    createdAt: Date;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Payment method type (e.g., "card", "bank_transfer")', example: 'card', required: false })
    paymentMethodType: string;

    @Column({ nullable: true })
    @ApiProperty({ description: 'Stripe payment method ID', example: 'pm_1Hq3d2J2eqhYzjzRtZZ8Ff6D', required: false })
    paymentMethodId: string;

    @Column({ type: 'timestamp', nullable: true })
    @ApiProperty({
        description: 'Timestamp when the user was deleted',
        example: '2025-01-10T00:00:00.000Z',
    })
    @IsOptional()
    deleted_at?: Date;

    @ManyToOne(() => User, (user) => user.payments, { nullable: false })
    @ApiProperty({
        description: 'User who made the payment',
        type: () => User,
    })
    user: User;
    
    @ManyToOne(() => Reservation, (reservation) => reservation.payments, { nullable: false })
    @ApiProperty({
        description: 'Reservation associated with the payment',
        type: () => Reservation,
    })
    reservation: Reservation;
}

