import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stripe } from 'stripe';
import { Payment } from './entities/payment.entity';
import { ReservationsService } from '../reservations/reservations.service';
import { ReservationStatus } from 'src/enums/reservation-status.enum';


@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripe: Stripe,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly reservationsService: ReservationsService,

  ) { }

  async createPaymentIntent(CreatePaymentDto) {
    const { reservationId, currency } = CreatePaymentDto
    const reservation = await this.reservationsService.findOne(reservationId);
    const totalAmount = reservation.totalAmount;
    const userId = reservation.user.id;
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency,
    });

    const payment = this.paymentRepository.create({
      totalAmount,
      currency,
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      reservation: { id: reservationId },
      user: { id: userId }
    });

    await this.paymentRepository.save(payment);

    return {
      clientSecret: paymentIntent.client_secret,
      reservationId,
      userId
    };
  };

  async paymentCheck (paymentIntentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { paymentIntentId },
      relations: ['reservation'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const stripePaymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    payment.status = stripePaymentIntent.status === 'succeeded'
      ? 'succeeded'
      : (stripePaymentIntent.status === 'canceled' ? 'canceled' : payment.status);

    const paymentMethodId = stripePaymentIntent.status === 'succeeded'
      ? stripePaymentIntent.payment_method as string
      : undefined;

    const paymentMethod = paymentMethodId ? await this.stripe.paymentMethods.retrieve(paymentMethodId) : null;

    paymentMethod && (payment.paymentMethodType = paymentMethod.type);
    paymentMethod && (payment.paymentMethodId = paymentMethodId);

    await this.paymentRepository.save(payment);

    const reservation = payment.reservation;
    reservation && await this.reservationsService.updateReservationStatus(
      reservation.id,
      stripePaymentIntent.status === 'succeeded'
        ? ReservationStatus.CONFIRMED
        : (stripePaymentIntent.status === 'canceled' ? ReservationStatus.CANCELLED : reservation.status)
    );

    return {
      status: stripePaymentIntent.status,
      payment,
    };
  };

  async getPaymentStatus(paymentIntentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { paymentIntentId },
      relations: ['reservation'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const stripePaymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: stripePaymentIntent.status,
      payment,
    };
  };
}