import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [forwardRef(() => PaymentsModule)],
  providers: [MailService],
  exports: [MailService],
})
export class MailsModule {}
