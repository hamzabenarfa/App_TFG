import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService],
  imports: [MailerModule],
})
export class DeliveryModule {}
