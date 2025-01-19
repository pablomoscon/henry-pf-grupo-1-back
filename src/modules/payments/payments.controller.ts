import { Controller, Post, Get, Body, Param, NotFoundException, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { create } from 'domain';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('payments')
@ApiTags('Payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPaymentIntent(
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    return await this.paymentsService.createPaymentIntent(createPaymentDto);
  };

  @Post('payment-check/:paymentIntentId')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(
    @Param('paymentIntentId') paymentIntentId: string
  ) {
      const confirmation = await this.paymentsService.paymentCheck(paymentIntentId);
      return confirmation; 
  };

@Get('status/:id')
@HttpCode(HttpStatus.OK)
  async getPaymentStatus(@Param('id') id: string) {
    const status = await this.paymentsService.getPaymentStatus(id);
    return status;
  };
}
