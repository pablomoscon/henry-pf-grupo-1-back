import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res, Param, HttpException, Query, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get('create-checkout-session/:reservationId')
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Param('reservationId') reservationId: string,
    @Res() res: Response  // Usamos @Res() para acceder al objeto Response
  ): Promise<void> {  // Cambiamos el tipo de retorno a void
    try {
      const sessionUrl = await this.paymentsService.createCheckoutSession(reservationId);

      // Realizamos la redirección a la URL proporcionada por Stripe
      return res.redirect(sessionUrl);  // Redirige automáticamente al cliente
    } catch (error) {
      throw new HttpException('Error creating the Stripe session', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get('status')
  async paymentStatus(
    @Query('sessionId') sessionId: string,
    @Query('status') status: string
  ): Promise<string> {
    try {
      if (status === 'succeeded') {
        await this.paymentsService.updateReservationAndPaymentStatus(sessionId, 'succeeded');
        return 'Payment successful and reservation confirmed';
      } else if (status === 'canceled') {
        await this.paymentsService.updateReservationAndPaymentStatus(sessionId, 'canceled');
        return 'Payment canceled and reservation canceled';
      } else {
        throw new Error('Unknown payment status');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };
}

