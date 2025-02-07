import {
  Controller,
  HttpCode,
  HttpStatus,
  Res,
  Param,
  HttpException,
  Query,
  Get,
  UseGuards,
  Post,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/roles.enum';
import { RolesGuard } from 'src/guards/roles/roles.guard';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
@ApiTags('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session/:reservationId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Param('reservationId') reservationId: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const sessionUrl = await this.paymentsService.createCheckoutSession(reservationId);

      return res.json({ sessionUrl });
    } catch (error) {
      throw new HttpException(
        'Error creating the Stripe session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.paymentsService.findAll();
  };

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async paymentStatus(
    @Query('sessionId') sessionId: string,
    @Query('status') status: string,
  ): Promise<string> {
    try {
      if (status === 'succeeded') {
        await this.paymentsService.updateReservationAndPaymentStatus(
          sessionId,
          'succeeded',
        );
        return 'Payment successful and reservation confirmed';
      } else if (status === 'canceled') {
        await this.paymentsService.updateReservationAndPaymentStatus(
          sessionId,
          'canceled',
        );
        return 'Payment canceled and reservation canceled';
      } else {
        throw new Error('Unknown payment status');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.paymentsService.findOne(id);
  };

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return await this.paymentsService.update(id, updatePaymentDto);
  };

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.paymentsService.remove(id);
  };
}
