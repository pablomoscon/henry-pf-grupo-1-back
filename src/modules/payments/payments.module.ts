import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { ReservationsModule } from '../reservations/reservations.module';
import { MailsModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]),
    forwardRef(() => MailsModule),
    forwardRef(() => ReservationsModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService,
    {
      provide: Stripe,
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');
        return new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' });
      },
      inject: [ConfigService],
    },
  ],
  exports: [Stripe, PaymentsService]
})
export class PaymentsModule { }