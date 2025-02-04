import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Stripe } from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { ReservationsService } from '../reservations/reservations.service';
import { ReservationStatus } from 'src/enums/reservation-status.enum';
import { MailService } from '../mail/mail.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripe: Stripe,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => ReservationsService))
    private readonly reservationsService: ReservationsService,
    @Inject(forwardRef(() => MailService))
    private readonly mailsService: MailService,
  ) { }

  async createCheckoutSession(reservationId: string): Promise<string> {
    try {
      const reservation = await this.reservationsService.findOne(reservationId);

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: reservation.user.email,
        mode: 'payment',
        success_url: `http://localhost:3001/payment?&status=succeeded&sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3001/payment?&status=canceled&sessionId={CHECKOUT_SESSION_ID}`,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: reservation.room.name,
                description: `Reservation for ${reservation.checkInDate} to ${reservation.checkOutDate} by ${reservation.user.name}`,
                metadata: {
                  customerId: reservation.user.customerId,
                  numberOfCats: reservation.cats.length,
                  cats: JSON.stringify(reservation.cats.map(cat => cat.id)),
                },
              },
              unit_amount: reservation.totalAmount * 100,
            },
            quantity: 1,
          },
        ],
      });

      const payment = new Payment();
      payment.user = reservation.user;
      payment.reservation = reservation;
      payment.totalAmount = reservation.totalAmount;
      payment.status = 'pending';
      payment.currency = 'usd';
      payment.sessionId = session.id;
      await this.paymentRepository.save(payment);

      return session.url;
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      throw new Error('Error creating Stripe session');
    }
  };

  async updateReservationAndPaymentStatus(sessionId: string, status: string): Promise<void> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { sessionId: sessionId },
        relations: ['reservation'],
      });
      if (!payment) {
        throw new Error('Payment not found');
      }

      const newPaymentStatus = status === 'succeeded'
        ? 'succeeded'
        : status === 'canceled'
          ? 'canceled'
          : payment.status;

      payment.status = newPaymentStatus;
      await this.paymentRepository.save(payment);

      const reservation = await this.reservationsService.findOne(payment.reservation.id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      const newReservationStatus = status === 'succeeded'
        ? ReservationStatus.CONFIRMED
        : status === 'canceled'
          ? ReservationStatus.CANCELLED
          : reservation.status;

      await this.reservationsService.updateReservationStatus(reservation.id, newReservationStatus);
      this.mailsService.sendConfirmatedReservation(reservation);

    } catch (error) {
      console.error('Error updating payment and reservation status:', error);
      throw new Error('Error updating payment and reservation status');
    }
  };

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { deleted_at: IsNull() }
    });
  };

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'reservation'],
    });

    if (!payment) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return payment;
  };

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    await this.paymentRepository.update(id, updatePaymentDto);
    return this.findOne(id);
  };

  async remove(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    payment.deleted_at = new Date();
    return this.paymentRepository.save(payment);
  };
}
