import { Controller, HttpCode, HttpStatus, Res, Param, HttpException, Query, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get('create-checkout-session/:reservationId')
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Param('reservationId') reservationId: string,
    @Res() res: Response  
  ): Promise<void> {  
    try {
      const sessionUrl = await this.paymentsService.createCheckoutSession(reservationId);

      return res.redirect(sessionUrl); 
    } catch (error) {
      throw new HttpException('Error creating the Stripe session', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };

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

